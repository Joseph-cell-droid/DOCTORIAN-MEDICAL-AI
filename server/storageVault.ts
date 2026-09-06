import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 1 GB allocated in bytes (1024 * 1024 * 1024 bytes)
export const FREE_STORAGE_QUOTA_BYTES = 1073741824; // 1,073,741,824 bytes = 1 GB

export interface StorageVaultFile {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: 'document' | 'scan' | 'lab_report' | 'user_data' | 'media';
  filePath: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export function setupStorageVaultRoutes(
  app: express.Application,
  db: any,
  jwtSecret: string,
  sendEmail: (to: string, subject: string, text: string, html?: string) => Promise<void>
) {
  const UPLOADS_DIR = path.join(process.cwd(), 'data', 'storage_vault');
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('[Storage Vault] Error creating uploads dir:', err);
  }

  // Create tables for 1GB Vault Files and 2-Way Verification
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_storage_files (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        originalName TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        size INTEGER NOT NULL,
        category TEXT DEFAULT 'document',
        filePath TEXT NOT NULL,
        metadata TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS storage_2fa_challenges (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        verified INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );
    `);
    console.log('[Storage Vault] Database schemas verified. 1GB Quota enabled per account.');
  } catch (err: any) {
    console.error('[Storage Vault] Schema initialization error:', err.message);
  }

  // Configure Multer for File Uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const user = (req as any).vaultUser;
      const userDir = path.join(UPLOADS_DIR, user?.id || 'common');
      try {
        fs.mkdirSync(userDir, { recursive: true });
      } catch (e) {}
      cb(null, userDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${uniqueSuffix}-${safeName}`);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 250 * 1024 * 1024, // 250MB single file limit, capped by total 1GB quota
    },
  });

  // Helper to calculate used bytes
  function getUserStorageUsage(userId: string) {
    try {
      const row: any = db
        .prepare(
          'SELECT COALESCE(SUM(size), 0) as usedBytes, COUNT(*) as fileCount FROM user_storage_files WHERE userId = ?'
        )
        .get(userId);
      const usedBytes = Number(row?.usedBytes || 0);
      const fileCount = Number(row?.fileCount || 0);
      const freeBytes = Math.max(0, FREE_STORAGE_QUOTA_BYTES - usedBytes);
      const percentUsed = Math.min(100, Number(((usedBytes / FREE_STORAGE_QUOTA_BYTES) * 100).toFixed(2)));

      return {
        totalQuotaBytes: FREE_STORAGE_QUOTA_BYTES,
        usedBytes,
        freeBytes,
        fileCount,
        percentUsed,
      };
    } catch (err) {
      return {
        totalQuotaBytes: FREE_STORAGE_QUOTA_BYTES,
        usedBytes: 0,
        freeBytes: FREE_STORAGE_QUOTA_BYTES,
        fileCount: 0,
        percentUsed: 0,
      };
    }
  }

  // Middleware: Require Vault 2FA Unlock Token
  function requireVaultAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token as string;
    } else if (req.cookies && req.cookies.vault_token) {
      token = req.cookies.vault_token;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Vault is locked. Enter account password and two-way verification to unlock.',
        locked: true,
      });
    }

    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      if (!decoded.userId || decoded.scope !== '1gb_vault_unlocked') {
        return res.status(403).json({ error: 'Invalid vault access credentials', locked: true });
      }

      // Check if user still exists
      const user: any = db.prepare('SELECT id, email, displayName, role FROM users WHERE id = ?').get(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'Account not found', locked: true });
      }

      (req as any).vaultUser = user;
      next();
    } catch (err: any) {
      return res.status(401).json({
        error: 'Vault session expired. Please re-authenticate with password and two-way verification.',
        locked: true,
      });
    }
  }

  // ==========================================
  // 1. STEP 1 & 2: REQUEST 2-WAY VERIFICATION
  // ==========================================
  app.post('/api/storage/request-2fa', async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Account email and password are required' });
      }

      const user: any = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
      if (!user) {
        return res.status(404).json({ error: 'Account not found. Please register or verify email.' });
      }

      // Validate account password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Incorrect account password. Access denied.' });
      }

      // Generate a secure 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const challengeId = 'ch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      // Save challenge to database
      db.prepare(
        'INSERT INTO storage_2fa_challenges (id, userId, email, code, expiresAt, verified, createdAt) VALUES (?, ?, ?, ?, ?, 0, ?)'
      ).run(challengeId, user.id, user.email, verificationCode, expiresAt, new Date().toISOString());

      // Mask email for security display (e.g. j***@example.com)
      const parts = user.email.split('@');
      const maskedEmail =
        parts[0].length > 2
          ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`
          : `***@${parts[1]}`;

      // Dispatch 2-way verification email notification
      const emailText = `Hello ${user.displayName || 'Doctorian User'},\n\nYour two-way verification code to access your 1GB Free Cloud Document & File Vault is:\n\n🔑 ${verificationCode}\n\nThis security code is valid for 10 minutes.\nIf you did not initiate this request, please change your account password immediately.\n\nDoctorian Secure Core Team`;
      
      sendEmail(
        user.email,
        '🔑 1GB Vault Two-Way Verification Code: ' + verificationCode,
        emailText
      ).catch((e) => console.warn('[Storage Vault 2FA] Email dispatch log:', e.message));

      return res.json({
        success: true,
        message: `Two-way verification code sent to ${maskedEmail}`,
        challengeId,
        maskedEmail,
        // Provided for developer preview, demo accounts, or when SMTP is offline
        demoCode: verificationCode,
        expiresInSeconds: 600,
      });
    } catch (err: any) {
      console.error('[Storage Vault 2FA Request Error]:', err);
      return res.status(500).json({ error: 'Failed to process security gateway: ' + err.message });
    }
  });

  // ==========================================
  // 2. STEP 2: VERIFY 2-WAY CODE & UNLOCK VAULT
  // ==========================================
  app.post('/api/storage/verify-2fa', async (req: express.Request, res: express.Response) => {
    try {
      const { email, password, code, challengeId } = req.body;
      if (!email || !password || !code) {
        return res.status(400).json({ error: 'Email, password, and two-way verification code are required' });
      }

      const user: any = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
      if (!user) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Incorrect account password' });
      }

      // Verify code
      let challenge: any = null;
      if (challengeId) {
        challenge = db
          .prepare('SELECT * FROM storage_2fa_challenges WHERE id = ? AND userId = ?')
          .get(challengeId, user.id);
      } else {
        challenge = db
          .prepare(
            'SELECT * FROM storage_2fa_challenges WHERE userId = ? ORDER BY expiresAt DESC LIMIT 1'
          )
          .get(user.id);
      }

      if (!challenge) {
        return res.status(400).json({ error: 'No active two-way verification request found. Request a new code.' });
      }

      if (Date.now() > challenge.expiresAt) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }

      if (challenge.code !== code.trim()) {
        return res.status(401).json({ error: 'Invalid two-way verification code. Please check your email or code.' });
      }

      // Mark challenge as used
      db.prepare('UPDATE storage_2fa_challenges SET verified = 1 WHERE id = ?').run(challenge.id);

      // Issue Vault Unlock Token (4 hours session)
      const vaultToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          displayName: user.displayName,
          scope: '1gb_vault_unlocked',
        },
        jwtSecret,
        { expiresIn: '4h' }
      );

      const usage = getUserStorageUsage(user.id);

      return res.json({
        success: true,
        message: '1GB Secure Cloud Vault unlocked successfully!',
        vaultToken,
        quota: usage,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (err: any) {
      console.error('[Storage Vault 2FA Verify Error]:', err);
      return res.status(500).json({ error: 'Verification error: ' + err.message });
    }
  });

  // ==========================================
  // 3. GET VAULT STATUS & STORAGE BREAKDOWN
  // ==========================================
  app.get('/api/storage/status', requireVaultAuth, (req: express.Request, res: express.Response) => {
    const user = (req as any).vaultUser;
    const usage = getUserStorageUsage(user.id);

    // Get breakdown by category
    const categories = db
      .prepare(
        'SELECT category, COUNT(*) as count, COALESCE(SUM(size), 0) as bytes FROM user_storage_files WHERE userId = ? GROUP BY category'
      )
      .all(user.id);

    return res.json({
      success: true,
      quota: usage,
      categories,
    });
  });

  // ==========================================
  // 4. LIST FILES IN 1GB VAULT
  // ==========================================
  app.get('/api/storage/files', requireVaultAuth, (req: express.Request, res: express.Response) => {
    const user = (req as any).vaultUser;
    const { category, search } = req.query;

    let query = 'SELECT * FROM user_storage_files WHERE userId = ?';
    const params: any[] = [user.id];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ' AND (name LIKE ? OR originalName LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY createdAt DESC';

    const files = db.prepare(query).all(...params);
    const usage = getUserStorageUsage(user.id);

    return res.json({
      success: true,
      files,
      quota: usage,
    });
  });

  // ==========================================
  // 5. UPLOAD FILE INTO 1GB VAULT
  // ==========================================
  app.post(
    '/api/storage/upload',
    requireVaultAuth,
    upload.single('file'),
    async (req: express.Request, res: express.Response) => {
      try {
        const user = (req as any).vaultUser;
        const file = req.file;

        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileSize = file.size;
        const usage = getUserStorageUsage(user.id);

        // Check if upload exceeds the 1GB quota
        if (usage.usedBytes + fileSize > FREE_STORAGE_QUOTA_BYTES) {
          // Remove uploaded file from disk to prevent storage leak
          try {
            fs.unlinkSync(file.path);
          } catch (e) {}

          const remainingMB = (usage.freeBytes / (1024 * 1024)).toFixed(2);
          const requestedMB = (fileSize / (1024 * 1024)).toFixed(2);
          return res.status(400).json({
            error: `1GB storage quota exceeded. Requested: ${requestedMB} MB, Available: ${remainingMB} MB. Delete older files to free space.`,
          });
        }

        const fileId = 'vf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const category = (req.body.category as string) || determineCategory(file.mimetype, file.originalname);
        const customName = req.body.name ? req.body.name.trim() : file.originalname;
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO user_storage_files (
            id, userId, name, originalName, mimeType, size, category, filePath, metadata, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          fileId,
          user.id,
          customName,
          file.originalname,
          file.mimetype,
          fileSize,
          category,
          file.path,
          JSON.stringify({ encoding: file.encoding, destination: file.destination }),
          now,
          now
        );

        const updatedUsage = getUserStorageUsage(user.id);

        return res.json({
          success: true,
          message: 'File successfully stored in your 1GB Cloud Vault',
          file: {
            id: fileId,
            userId: user.id,
            name: customName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: fileSize,
            category,
            createdAt: now,
          },
          quota: updatedUsage,
        });
      } catch (err: any) {
        console.error('[Storage Vault Upload Error]:', err);
        return res.status(500).json({ error: 'Failed to upload file: ' + err.message });
      }
    }
  );

  // ==========================================
  // 6. SAVE STRUCTURED USER DATA / TEXT DOCUMENT
  // ==========================================
  app.post('/api/storage/save-data', requireVaultAuth, (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const { name, content, category = 'user_data', mimeType = 'application/json' } = req.body;

      if (!name || content === undefined) {
        return res.status(400).json({ error: 'Document name and content are required' });
      }

      const stringContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      const byteSize = Buffer.byteLength(stringContent, 'utf8');

      const usage = getUserStorageUsage(user.id);
      if (usage.usedBytes + byteSize > FREE_STORAGE_QUOTA_BYTES) {
        return res.status(400).json({ error: '1GB storage limit exceeded' });
      }

      const userDir = path.join(UPLOADS_DIR, user.id);
      fs.mkdirSync(userDir, { recursive: true });

      const fileId = 'vf_data_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const safeFilename = `${fileId}_${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(userDir, safeFilename);

      fs.writeFileSync(filePath, stringContent, 'utf8');

      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO user_storage_files (
          id, userId, name, originalName, mimeType, size, category, filePath, metadata, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        fileId,
        user.id,
        name,
        name,
        mimeType,
        byteSize,
        category,
        filePath,
        JSON.stringify({ type: 'structured_user_data' }),
        now,
        now
      );

      const updatedUsage = getUserStorageUsage(user.id);

      return res.json({
        success: true,
        message: 'Data successfully recorded in your 1GB Vault',
        file: {
          id: fileId,
          name,
          size: byteSize,
          category,
          createdAt: now,
        },
        quota: updatedUsage,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to save data: ' + err.message });
    }
  });

  // ==========================================
  // 7. DOWNLOAD / STREAM FILE FROM 1GB VAULT
  // ==========================================
  app.get('/api/storage/download/:fileId', requireVaultAuth, (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const fileId = req.params.fileId;

      const file: any = db
        .prepare('SELECT * FROM user_storage_files WHERE id = ? AND userId = ?')
        .get(fileId, user.id);

      if (!file) {
        return res.status(404).json({ error: 'File not found in your vault' });
      }

      if (!fs.existsSync(file.filePath)) {
        return res.status(404).json({ error: 'File content does not exist on disk' });
      }

      res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.originalName || file.name)}"`
      );
      res.setHeader('Content-Length', file.size);

      const stream = fs.createReadStream(file.filePath);
      stream.pipe(res);
    } catch (err: any) {
      res.status(500).json({ error: 'Download error: ' + err.message });
    }
  });

  // ==========================================
  // 8. PREVIEW / VIEW FILE CONTENT
  // ==========================================
  app.get('/api/storage/preview/:fileId', requireVaultAuth, (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const fileId = req.params.fileId;

      const file: any = db
        .prepare('SELECT * FROM user_storage_files WHERE id = ? AND userId = ?')
        .get(fileId, user.id);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (!fs.existsSync(file.filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      // If text/json and small, return content as string
      if (
        file.size < 2 * 1024 * 1024 &&
        (file.mimeType.startsWith('text/') || file.mimeType.includes('json') || file.mimeType.includes('xml'))
      ) {
        const text = fs.readFileSync(file.filePath, 'utf8');
        return res.json({
          success: true,
          file,
          previewType: 'text',
          content: text,
        });
      }

      // For images, pipe inline
      if (file.mimeType.startsWith('image/')) {
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
        return fs.createReadStream(file.filePath).pipe(res);
      }

      // For PDFs, pipe inline
      if (file.mimeType === 'application/pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
        return fs.createReadStream(file.filePath).pipe(res);
      }

      return res.json({
        success: true,
        file,
        previewType: 'binary',
        message: 'File can be downloaded',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Preview error: ' + err.message });
    }
  });

  // ==========================================
  // 9. DELETE FILE & RECLAIM 1GB QUOTA
  // ==========================================
  app.delete('/api/storage/files/:fileId', requireVaultAuth, (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const fileId = req.params.fileId;

      const file: any = db
        .prepare('SELECT * FROM user_storage_files WHERE id = ? AND userId = ?')
        .get(fileId, user.id);

      if (!file) {
        return res.status(404).json({ error: 'File not found in your vault' });
      }

      // Delete file from disk
      try {
        if (fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }
      } catch (err) {
        console.warn('[Storage Vault] Could not delete disk file:', err);
      }

      // Delete file record from DB
      db.prepare('DELETE FROM user_storage_files WHERE id = ? AND userId = ?').run(fileId, user.id);

      const updatedUsage = getUserStorageUsage(user.id);

      return res.json({
        success: true,
        message: `File deleted. Reclaimed ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
        deletedFileId: fileId,
        quota: updatedUsage,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete file: ' + err.message });
    }
  });

  // Helper to categorize MIME types
  function determineCategory(
    mimeType: string,
    filename: string
  ): 'document' | 'scan' | 'lab_report' | 'user_data' | 'media' {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.dcm' || filename.toLowerCase().includes('mri') || filename.toLowerCase().includes('ct_scan')) {
      return 'scan';
    }
    if (filename.toLowerCase().includes('lab') || filename.toLowerCase().includes('blood') || filename.toLowerCase().includes('biopsy')) {
      return 'lab_report';
    }
    if (mimeType.startsWith('image/') || mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
      return 'media';
    }
    if (mimeType.includes('json') || ext === '.json' || ext === '.csv') {
      return 'user_data';
    }
    return 'document';
  }
}
