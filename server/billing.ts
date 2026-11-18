import crypto from 'crypto';
import type express from 'express';
import { db, logAudit } from './db.ts';
import { SERVER_SECRETS, getClientIp, recordSecurityEvent } from './security.ts';

export const FREE_STORAGE_QUOTA_BYTES = 1073741824; // 1.00 GB = 1,073,741,824 bytes

export interface ProtocolPlanCatalogItem {
  id: 'core' | 'catalyst' | 'quantum';
  tier: 'free' | 'pro' | 'enterprise';
  name: string;
  amountUgx: number;
  priceLabel: string;
  period: string;
  creditsGranted: number;
  storageBonusBytes: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface StoragePackCatalogItem {
  id: 'storage_5gb' | 'storage_20gb' | 'storage_100gb' | 'storage_1tb';
  name: string;
  addedBytes: number;
  formattedSize: string;
  amount: number;
  amountUgx: number;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface SmsBundleCatalogItem {
  id: 'sms_pack_100' | 'sms_pack_500' | 'sms_pack_2500';
  name: string;
  smsCredits: number;
  ratePerSmsUgx: number;
  wholesaleCostPerSmsUgx: number;
  amountUgx: number;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const SMS_BUNDLE_CATALOG: Record<string, SmsBundleCatalogItem> = {
  sms_pack_100: {
    id: 'sms_pack_100',
    name: 'Starter 100 SMS Pack',
    smsCredits: 100,
    ratePerSmsUgx: 120,
    wholesaleCostPerSmsUgx: 60,
    amountUgx: 12000,
    price: '12,000 UGX',
    description: 'Verified patient appointment alerts, consultation links, and connected peer SMS.',
    features: ['100 Priority SMS Credits', '120 UGX / SMS segment', 'Abuse-Shield & Audit Protected', 'Instant Gateway Activation']
  },
  sms_pack_500: {
    id: 'sms_pack_500',
    name: 'Clinic Growth 500 SMS Pack',
    smsCredits: 500,
    ratePerSmsUgx: 90,
    wholesaleCostPerSmsUgx: 55,
    amountUgx: 45000,
    price: '45,000 UGX',
    popular: true,
    description: 'Designed for clinics and telehealth doctors sending batch updates to connected patients.',
    features: ['500 Priority SMS Credits', '90 UGX / SMS segment (25% off)', 'Multi-Recipient Broadcasts', 'Delivery Receipt Telemetry']
  },
  sms_pack_2500: {
    id: 'sms_pack_2500',
    name: 'Hospital Pro 2,500 SMS Pack',
    smsCredits: 2500,
    ratePerSmsUgx: 72,
    wholesaleCostPerSmsUgx: 50,
    amountUgx: 180000,
    price: '180,000 UGX',
    description: 'High-volume hospital SMS dispatch across departments with full margin reporting.',
    features: ['2,500 Priority SMS Credits', '72 UGX / SMS segment (40% off)', 'Hospital-Wide Dispatch Mesh', 'Priority Carrier Failover']
  }
};

export const PROTOCOL_CATALOG: Record<string, ProtocolPlanCatalogItem> = {
  core: {
    id: 'core',
    tier: 'free',
    name: 'Clinical Core',
    amountUgx: 0,
    priceLabel: '0 UGX',
    period: 'Forever',
    creditsGranted: 400,
    storageBonusBytes: 0,
    description: 'Essential neural monitoring for individual health tracking + 1.00 GB Cloud Vault.',
    features: [
      '400 Neural Energy Units / Month',
      '1.00 GB Encrypted Cloud Storage Vault',
      'Advanced Symptom Mapper',
      'WHO-Aligned Emergency Nodes'
    ]
  },
  catalyst: {
    id: 'catalyst',
    tier: 'pro',
    name: 'Neural Catalyst',
    amountUgx: 50000,
    priceLabel: '50,000 UGX',
    period: 'Per Month',
    creditsGranted: 5000,
    storageBonusBytes: 5 * 1024 * 1024 * 1024,
    isPopular: true,
    description: 'Autonomous AI synthesis, specialist network priority, and expanded telemetry throughput.',
    features: [
      '5,000 Neural Energy Units',
      '+5 GB Vault Quota Included',
      '3D Organ Bio-Simulation',
      'Priority Clinical Sync Queue',
      'Health Data Export (L1 Logic)'
    ]
  },
  quantum: {
    id: 'quantum',
    tier: 'enterprise',
    name: 'Universal Quantum',
    amountUgx: 150000,
    priceLabel: '150,000 UGX',
    period: 'Per Month',
    creditsGranted: 999999,
    storageBonusBytes: 20 * 1024 * 1024 * 1024,
    description: 'Enterprise clinical framework for hospitals, labs, and unlimited AI throughput.',
    features: [
      'Unlimited Neural Energy Units',
      '+20 GB Hospital Vault Quota',
      'Family Neural Cloud (5 users)',
      'Real-time Concierge MD Sync',
      'Enterprise Clinical API Access'
    ]
  }
};

export const STORAGE_EXPANSION_CATALOG: Record<string, StoragePackCatalogItem> = {
  storage_5gb: {
    id: 'storage_5gb',
    name: '+5 GB Clinical Expansion',
    addedBytes: 5 * 1024 * 1024 * 1024,
    formattedSize: '+5 GB',
    amount: 5000,
    amountUgx: 5000,
    price: '5,000 UGX',
    description: 'Ideal for extended high-res medical records, lab reports, and vitals history.',
    features: ['+5 GB Encrypted Cloud Vault', '100 MB Max File Size Cap', 'Up to 2,500 Files', 'Instant Quota Activation']
  },
  storage_20gb: {
    id: 'storage_20gb',
    name: '+20 GB Diagnostic & Imaging Archive',
    addedBytes: 20 * 1024 * 1024 * 1024,
    formattedSize: '+20 GB',
    amount: 18000,
    amountUgx: 18000,
    price: '18,000 UGX',
    popular: true,
    description: 'Designed for radiology scans, MRI/CT archives, and high-frequency sensor telemetry.',
    features: ['+20 GB High-Speed Cloud Storage', '100 MB Max File Size Cap', 'Up to 5,000 Files', 'Continuous Neural Sync']
  },
  storage_100gb: {
    id: 'storage_100gb',
    name: '+100 GB Multi-Patient & Clinic Cloud',
    addedBytes: 100 * 1024 * 1024 * 1024,
    formattedSize: '+100 GB',
    amount: 65000,
    amountUgx: 65000,
    price: '65,000 UGX',
    description: 'Comprehensive capacity for multiple patient profiles, video consultations, and deep clinical data.',
    features: ['+100 GB Hospital-Grade Storage', '250 MB Max File Size Cap', 'Up to 25,000 Files', 'Audit-Ready Retention']
  },
  storage_1tb: {
    id: 'storage_1tb',
    name: '+1 TB Enterprise Medical Repository',
    addedBytes: 1024 * 1024 * 1024 * 1024,
    formattedSize: '+1 TB',
    amount: 250000,
    amountUgx: 250000,
    price: '250,000 UGX',
    description: 'Maximum cloud archival tier for enterprise institutions and research facilities.',
    features: ['+1 TB Unlimited Archival Quota', '250 MB Max File Size Cap', 'Up to 100,000 Files', '24/7 Priority Support']
  }
};

export const PAYMENT_METHODS_CATALOG = [
  { id: 'momo', name: 'MTN Mobile Money (UG)', code: 'MTN_MOMO_UG', instant: true, feePct: 0 },
  { id: 'airtel_money', name: 'Airtel Money (UG)', code: 'AIRTEL_UG', instant: true, feePct: 0 },
  { id: 'card', name: 'Visa / Mastercard 3D-Secure', code: 'CARD_3DS', instant: true, feePct: 0 },
  { id: 'flutterwave', name: 'Flutterwave East Africa Gateway', code: 'FLW_EA', instant: true, feePct: 0 }
];

export function computeTaxBreakdownUgx(grossAmountUgx: number) {
  if (!grossAmountUgx || grossAmountUgx <= 0) {
    return { subtotalUgx: 0, vatUgx: 0, totalUgx: 0 };
  }
  // Uganda VAT 18% inclusive breakdown for transparent clinical invoicing
  const subtotalUgx = Math.round(grossAmountUgx / 1.18);
  const vatUgx = grossAmountUgx - subtotalUgx;
  return { subtotalUgx, vatUgx, totalUgx: grossAmountUgx };
}

export function signBillingReceipt(payload: {
  id: string;
  invoiceNumber: string;
  userId: string;
  kind: string;
  itemId: string;
  amountUgx: number;
  paymentMethod: string;
  createdAt: string;
}): string {
  const canonical = [
    payload.id,
    payload.invoiceNumber,
    payload.userId,
    payload.kind,
    payload.itemId,
    String(payload.amountUgx),
    payload.paymentMethod,
    payload.createdAt
  ].join('|');
  return crypto.createHmac('sha256', SERVER_SECRETS.hmacSecret).update(canonical).digest('hex');
}

export interface CheckoutInput {
  userId: string;
  kind: 'protocol' | 'storage' | 'sms_bundle';
  itemId: string;
  paymentMethod: string;
  payerPhone?: string;
  externalRef?: string;
  idempotencyKey?: string;
  ip?: string;
}

export function executeVerifiedCheckout(
  input: CheckoutInput,
  dispatchNeuralSignal?: (signal: any) => any
) {
  const userRow = db
    .prepare(
      'SELECT id, email, display_name, role, status, subscription_tier, subscription_status, credits, storageQuotaBytes, sms_credits FROM users WHERE id = ?'
    )
    .get(input.userId) as any;

  if (!userRow || userRow.status !== 'active') {
    throw new Error('Active registered account required for billing checkout.');
  }
  if (userRow.role === 'guest') {
    throw new Error('Guest accounts cannot execute billing transactions. Please sign in.');
  }

  const cleanMethod = String(input.paymentMethod || 'momo').trim().toLowerCase().slice(0, 40);
  const cleanPhone = input.payerPhone ? String(input.payerPhone).trim().slice(0, 30) : null;
  const cleanIdempotency = input.idempotencyKey ? String(input.idempotencyKey).trim().slice(0, 120) : null;

  if (cleanIdempotency) {
    const existing = db
      .prepare('SELECT * FROM billing_transactions WHERE idempotency_key = ? AND user_id = ?')
      .get(cleanIdempotency, userRow.id) as any;
    if (existing) {
      return {
        deduplicated: true,
        transaction: formatTxRow(existing),
        user: readUserBillingProjection(userRow.id)
      };
    }
  }

  let itemName = '';
  let grossUgx = 0;
  let newTier = userRow.subscription_tier || 'free';
  let nextCredits = Number(userRow.credits ?? 400);
  const prevQuota = Number(userRow.storageQuotaBytes || FREE_STORAGE_QUOTA_BYTES);
  let nextQuota = prevQuota;
  const prevSmsCredits = Number(userRow.sms_credits ?? 25);
  let nextSmsCredits = prevSmsCredits;
  let metadataObj: Record<string, any> = {};

  if (input.kind === 'protocol') {
    const plan = PROTOCOL_CATALOG[input.itemId];
    if (!plan) {
      throw new Error(`Unknown clinical protocol plan: ${input.itemId}`);
    }
    itemName = plan.name;
    grossUgx = plan.amountUgx;
    newTier = plan.tier;
    nextCredits = plan.creditsGranted;
    if (plan.storageBonusBytes > 0) {
      nextQuota = Math.max(prevQuota, FREE_STORAGE_QUOTA_BYTES + plan.storageBonusBytes);
    }
    metadataObj = {
      planId: plan.id,
      tier: plan.tier,
      creditsGranted: plan.creditsGranted,
      storageBonusBytes: plan.storageBonusBytes
    };
  } else if (input.kind === 'storage') {
    const pack = STORAGE_EXPANSION_CATALOG[input.itemId];
    if (!pack) {
      throw new Error(`Unknown storage expansion tier: ${input.itemId}`);
    }
    itemName = `${pack.name} (${pack.formattedSize})`;
    grossUgx = pack.amountUgx;
    nextQuota = prevQuota + pack.addedBytes;
    metadataObj = {
      tierId: pack.id,
      addedBytes: pack.addedBytes,
      previousQuotaBytes: prevQuota,
      newQuotaBytes: nextQuota,
      formattedSize: pack.formattedSize
    };
  } else if (input.kind === 'sms_bundle') {
    const smsPack = SMS_BUNDLE_CATALOG[input.itemId];
    if (!smsPack) {
      throw new Error(`Unknown SMS credit bundle: ${input.itemId}`);
    }
    itemName = `${smsPack.name} (+${smsPack.smsCredits} SMS)`;
    grossUgx = smsPack.amountUgx;
    nextSmsCredits = prevSmsCredits + smsPack.smsCredits;
    metadataObj = {
      bundleId: smsPack.id,
      addedSmsCredits: smsPack.smsCredits,
      previousSmsCredits: prevSmsCredits,
      newSmsCredits: nextSmsCredits,
      ratePerSmsUgx: smsPack.ratePerSmsUgx
    };
  } else {
    throw new Error('Unsupported checkout category.');
  }

  const { subtotalUgx, vatUgx, totalUgx } = computeTaxBreakdownUgx(grossUgx);
  const nowIso = new Date().toISOString();
  const txId = `btx-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const invoiceNumber = `DOC-INV-${new Date().getFullYear()}-${crypto.randomInt(100000, 999999)}`;
  const extRef = input.externalRef ? String(input.externalRef).trim().slice(0, 80) : `DOC-PAY-${Date.now()}`;

  const receiptHmac = signBillingReceipt({
    id: txId,
    invoiceNumber,
    userId: userRow.id,
    kind: input.kind,
    itemId: input.itemId,
    amountUgx: totalUgx,
    paymentMethod: cleanMethod,
    createdAt: nowIso
  });

  const runAtomic = db.transaction(() => {
    db.prepare(`
      INSERT INTO billing_transactions (
        id, invoice_number, user_id, user_email, user_name, kind, item_id, item_name,
        subtotal_ugx, vat_ugx, amount_ugx, currency, payment_method, payer_phone,
        external_ref, idempotency_key, status, receipt_hmac, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UGX', ?, ?, ?, ?, 'completed', ?, ?, ?, ?)
    `).run(
      txId,
      invoiceNumber,
      userRow.id,
      userRow.email,
      userRow.display_name,
      input.kind,
      input.itemId,
      itemName,
      subtotalUgx,
      vatUgx,
      totalUgx,
      cleanMethod,
      cleanPhone,
      extRef,
      cleanIdempotency,
      receiptHmac,
      JSON.stringify(metadataObj),
      nowIso,
      nowIso
    );

    if (input.kind === 'protocol') {
      db.prepare(`
        UPDATE users
        SET subscription_tier = ?, subscription_status = 'active', credits = ?, storageQuotaBytes = ?, billing_updated_at = ?
        WHERE id = ?
      `).run(newTier, nextCredits, nextQuota, nowIso, userRow.id);
    } else if (input.kind === 'sms_bundle') {
      db.prepare(`
        UPDATE users
        SET sms_credits = ?, sms_revenue_ugx = COALESCE(sms_revenue_ugx, 0) + ?, billing_updated_at = ?
        WHERE id = ?
      `).run(nextSmsCredits, totalUgx, nowIso, userRow.id);
    } else {
      db.prepare(`
        UPDATE users
        SET storageQuotaBytes = ?, billing_updated_at = ?
        WHERE id = ?
      `).run(nextQuota, nowIso, userRow.id);

      const pack = STORAGE_EXPANSION_CATALOG[input.itemId];
      try {
        db.prepare(`
          INSERT INTO storage_purchases (
            id, userId, tierId, tierName, addedBytes, previousQuotaBytes, newQuotaBytes,
            amount, currency, paymentMethod, phone, transactionId, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UGX', ?, ?, ?, ?)
        `).run(
          `sp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          userRow.id,
          pack.id,
          pack.name,
          pack.addedBytes,
          prevQuota,
          nextQuota,
          totalUgx,
          cleanMethod,
          cleanPhone,
          extRef,
          nowIso
        );
      } catch {
        // storage_purchases table will be initialized when storageVault sets up
      }
    }
  });

  runAtomic();

  logAudit(
    userRow.id,
    userRow.email,
    userRow.role,
    input.kind === 'storage' ? 'STORAGE_BILLING_COMPLETED' : 'PROTOCOL_BILLING_COMPLETED',
    invoiceNumber,
    `${itemName} — UGX ${totalUgx.toLocaleString()} via ${cleanMethod.toUpperCase()}`
  );
  recordSecurityEvent(
    'BILLING_TRANSACTION_SIGNED',
    'info',
    input.ip || '127.0.0.1',
    userRow.email,
    `Signed invoice ${invoiceNumber} (${totalUgx} UGX)`
  );

  if (dispatchNeuralSignal) {
    try {
      dispatchNeuralSignal({
        channel: 'billing_ledger',
        eventType: 'billing',
        senderId: userRow.id,
        senderName: userRow.display_name,
        senderRole: userRow.role,
        targetRole: 'admin',
        targetUserId: userRow.id,
        subject: `Verified Billing Receipt ${invoiceNumber}`,
        content: `${userRow.display_name} completed ${itemName} for UGX ${totalUgx.toLocaleString()} via ${cleanMethod.toUpperCase()}. Receipt HMAC sealed.`,
        payload: {
          transactionId: txId,
          invoiceNumber,
          kind: input.kind,
          itemId: input.itemId,
          amountUgx: totalUgx,
          storageQuotaBytes: nextQuota
        },
        priority: 'normal'
      });
    } catch {
      // Non-blocking notification
    }
  }

  const row = db.prepare('SELECT * FROM billing_transactions WHERE id = ?').get(txId);
  return {
    deduplicated: false,
    transaction: formatTxRow(row),
    user: readUserBillingProjection(userRow.id)
  };
}

function readUserBillingProjection(userId: string) {
  const row = db
    .prepare(
      'SELECT id, email, display_name, role, subscription_tier, subscription_status, credits, storageQuotaBytes, sms_credits, billing_updated_at FROM users WHERE id = ?'
    )
    .get(userId) as any;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    subscriptionTier: row.subscription_tier || 'free',
    subscriptionStatus: row.subscription_status || 'active',
    credits: Number(row.credits ?? 400),
    storageQuotaBytes: Number(row.storageQuotaBytes || FREE_STORAGE_QUOTA_BYTES),
    smsCredits: Number(row.sms_credits ?? 25),
    billingUpdatedAt: row.billing_updated_at || null
  };
}

function formatTxRow(r: any) {
  let metadata: Record<string, any> = {};
  try {
    metadata = r.metadata_json ? JSON.parse(r.metadata_json) : {};
  } catch {
    metadata = {};
  }
  return {
    id: r.id,
    invoiceNumber: r.invoice_number,
    userId: r.user_id,
    userEmail: r.user_email,
    userName: r.user_name,
    kind: r.kind,
    itemId: r.item_id,
    itemName: r.item_name,
    subtotalUgx: Number(r.subtotal_ugx || 0),
    vatUgx: Number(r.vat_ugx || 0),
    amountUgx: Number(r.amount_ugx || 0),
    currency: r.currency || 'UGX',
    paymentMethod: r.payment_method,
    payerPhone: r.payer_phone || null,
    externalRef: r.external_ref || null,
    status: r.status,
    receiptHmac: r.receipt_hmac,
    metadata,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function csvCell(val: unknown): string {
  const str = String(val ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function setupBillingRoutes(
  app: express.Application,
  dispatchNeuralSignal?: (signal: any) => any
) {
  // Seed initial verified baseline transactions if empty so ledger demonstrates verifiable records immediately
  try {
    const cnt = (db.prepare('SELECT COUNT(*) as cnt FROM billing_transactions').get() as { cnt: number }).cnt;
    if (cnt === 0) {
      const seedUser = db
        .prepare("SELECT id, email, display_name FROM users WHERE id = 'usr-doctor-01' LIMIT 1")
        .get() as any;
      if (seedUser) {
        const t1 = '2026-11-10T09:15:00.000Z';
        const id1 = 'btx-seed-001';
        const inv1 = 'DOC-INV-2026-410220';
        const hmac1 = signBillingReceipt({
          id: id1,
          invoiceNumber: inv1,
          userId: seedUser.id,
          kind: 'protocol',
          itemId: 'catalyst',
          amountUgx: 50000,
          paymentMethod: 'momo',
          createdAt: t1
        });
        db.prepare(`
          INSERT INTO billing_transactions (
            id, invoice_number, user_id, user_email, user_name, kind, item_id, item_name,
            subtotal_ugx, vat_ugx, amount_ugx, currency, payment_method, payer_phone,
            external_ref, idempotency_key, status, receipt_hmac, metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'protocol', 'catalyst', 'Neural Catalyst', 42373, 7627, 50000, 'UGX', 'momo', '+256 772 881 104', 'MTN-UG-881204', 'seed-tx-1', 'completed', ?, ?, ?, ?)
        `).run(id1, inv1, seedUser.id, seedUser.email, seedUser.display_name, hmac1, JSON.stringify({ planId: 'catalyst', tier: 'pro' }), t1, t1);

        const seedPatient = db
          .prepare("SELECT id, email, display_name FROM users WHERE id = 'usr-patient-01' LIMIT 1")
          .get() as any;
        if (seedPatient) {
          const t2 = '2026-11-12T14:20:00.000Z';
          const id2 = 'btx-seed-002';
          const inv2 = 'DOC-INV-2026-772410';
          const hmac2 = signBillingReceipt({
            id: id2,
            invoiceNumber: inv2,
            userId: seedPatient.id,
            kind: 'protocol',
            itemId: 'core',
            amountUgx: 0,
            paymentMethod: 'free_tier_grant',
            createdAt: t2
          });
          db.prepare(`
            INSERT INTO billing_transactions (
              id, invoice_number, user_id, user_email, user_name, kind, item_id, item_name,
              subtotal_ugx, vat_ugx, amount_ugx, currency, payment_method, payer_phone,
              external_ref, idempotency_key, status, receipt_hmac, metadata_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'protocol', 'core', 'Clinical Core + 1.00 GB Free Vault', 0, 0, 0, 'UGX', 'free_tier_grant', '+256 772 410 220', 'DOC-1GB-PROVISION', 'seed-tx-2', 'completed', ?, ?, ?, ?)
          `).run(id2, inv2, seedPatient.id, seedPatient.email, seedPatient.display_name, hmac2, JSON.stringify({ planId: 'core', tier: 'free', storageQuotaBytes: FREE_STORAGE_QUOTA_BYTES }), t2, t2);
        }
      }
    }
  } catch (err) {
    console.warn('[Billing] Baseline seed check notice:', err);
  }

  // 1. Public Authoritative Catalog
  app.get('/api/billing/plans', (_req, res) => {
    res.json({
      success: true,
      protocols: Object.values(PROTOCOL_CATALOG),
      storagePacks: Object.values(STORAGE_EXPANSION_CATALOG),
      smsBundles: Object.values(SMS_BUNDLE_CATALOG),
      currency: 'UGX',
      vatRatePct: 18
    });
  });

  // 2. Payment Gateways & Nodes
  app.get('/api/billing/payment-methods', (_req, res) => {
    res.json({
      success: true,
      data: PAYMENT_METHODS_CATALOG
    });
  });

  // 3. Transaction History & Financial Summary
  app.get('/api/billing/history', (req: any, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to inspect billing ledger.' });
    }
    if (req.user.role === 'guest') {
      return res.json({
        history: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
        summary: { totalSpentUgx: 0, completedCount: 0, refundedCount: 0 }
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const status = typeof req.query.status === 'string' && req.query.status !== 'all' ? req.query.status : '';
    const kind = typeof req.query.kind === 'string' && req.query.kind !== 'all' ? req.query.kind : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const where: string[] = [];
    const params: any[] = [];

    if (req.user.role !== 'admin') {
      where.push('user_id = ?');
      params.push(req.user.id);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    if (kind) {
      where.push('kind = ?');
      params.push(kind);
    }
    if (search) {
      where.push('(invoice_number LIKE ? OR item_name LIKE ? OR user_name LIKE ? OR external_ref LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) as cnt FROM billing_transactions ${whereSql}`).get(...params) as { cnt: number }).cnt;
    const rows = db
      .prepare(`SELECT * FROM billing_transactions ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset) as any[];

    const summaryScopeWhere = req.user.role === 'admin' ? '' : 'WHERE user_id = ?';
    const summaryParams = req.user.role === 'admin' ? [] : [req.user.id];
    const summaryRow = db
      .prepare(`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount_ugx ELSE 0 END), 0) as totalSpentUgx,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completedCount,
          COALESCE(SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END), 0) as refundedCount
        FROM billing_transactions ${summaryScopeWhere}
      `)
      .get(...summaryParams) as any;

    res.json({
      success: true,
      history: rows.map(formatTxRow),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      },
      summary: {
        totalSpentUgx: Number(summaryRow?.totalSpentUgx || 0),
        completedCount: Number(summaryRow?.completedCount || 0),
        refundedCount: Number(summaryRow?.refundedCount || 0)
      },
      account: readUserBillingProjection(req.user.id)
    });
  });

  // 4. Unified Server-Validated Checkout (Protocols + Storage Expansion)
  app.post('/api/billing/checkout', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Registered account authentication required for billing checkout.' });
    }
    const { kind = 'protocol', itemId, paymentMethod = 'momo', payerPhone, externalRef, idempotencyKey } = req.body || {};
    if (!itemId || !['protocol', 'storage', 'sms_bundle'].includes(kind)) {
      return res.status(400).json({ error: 'Valid checkout kind (protocol | storage | sms_bundle) and itemId are required.' });
    }

    try {
      const result = executeVerifiedCheckout(
        {
          userId: req.user.id,
          kind,
          itemId: String(itemId),
          paymentMethod: String(paymentMethod),
          payerPhone: payerPhone ? String(payerPhone) : undefined,
          externalRef: externalRef ? String(externalRef) : undefined,
          idempotencyKey: idempotencyKey ? String(idempotencyKey) : undefined,
          ip: getClientIp(req)
        },
        dispatchNeuralSignal
      );
      return res.status(result.deduplicated ? 200 : 201).json({
        success: true,
        ...result
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Billing checkout failed.' });
    }
  });

  // 5. Subscribe Endpoint (Protocol Activation)
  app.post('/api/billing/subscribe', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Authenticated account required to activate protocols.' });
    }
    const { planId, transaction_id, paymentMethod = 'card', payerPhone, idempotencyKey } = req.body || {};
    if (!planId || !PROTOCOL_CATALOG[planId]) {
      return res.status(400).json({ error: 'Valid protocol planId (core | catalyst | quantum) is required.' });
    }
    try {
      const result = executeVerifiedCheckout(
        {
          userId: req.user.id,
          kind: 'protocol',
          itemId: planId,
          paymentMethod: String(paymentMethod),
          payerPhone,
          externalRef: transaction_id,
          idempotencyKey,
          ip: getClientIp(req)
        },
        dispatchNeuralSignal
      );
      return res.json({
        success: true,
        tier: result.user?.subscriptionTier || PROTOCOL_CATALOG[planId].tier,
        creditsAdded: PROTOCOL_CATALOG[planId].creditsGranted,
        transaction: result.transaction,
        user: result.user
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Subscription failed.' });
    }
  });

  // 6. Verify Cryptographic Receipt HMAC
  app.post('/api/billing/transactions/:id/verify', (req: any, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const row = db.prepare('SELECT * FROM billing_transactions WHERE id = ?').get(req.params.id) as any;
    if (!row) {
      return res.status(404).json({ error: 'Transaction record not found.' });
    }
    if (req.user.role !== 'admin' && row.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to inspect another user invoice.' });
    }
    const expectedHmac = signBillingReceipt({
      id: row.id,
      invoiceNumber: row.invoice_number,
      userId: row.user_id,
      kind: row.kind,
      itemId: row.item_id,
      amountUgx: Number(row.amount_ugx),
      paymentMethod: row.payment_method,
      createdAt: row.created_at
    });
    const verified = expectedHmac === row.receipt_hmac;
    return res.json({
      success: true,
      verified,
      invoiceNumber: row.invoice_number,
      status: row.status,
      signaturePrefix: String(row.receipt_hmac).slice(0, 16),
      verifiedAt: new Date().toISOString()
    });
  });

  // 7. Refund / Rollback Transaction
  app.post('/api/billing/transactions/:id/refund', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Authenticated account required.' });
    }
    const row = db.prepare('SELECT * FROM billing_transactions WHERE id = ?').get(req.params.id) as any;
    if (!row) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    if (req.user.role !== 'admin' && row.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: cannot refund another account transaction.' });
    }
    if (row.status === 'refunded') {
      return res.status(400).json({ error: 'Transaction has already been refunded.' });
    }
    if (Number(row.amount_ugx) <= 0) {
      return res.status(400).json({ error: 'Free tier provision cannot be refunded.' });
    }

    const nowIso = new Date().toISOString();
    const runRefund = db.transaction(() => {
      db.prepare("UPDATE billing_transactions SET status = 'refunded', updated_at = ? WHERE id = ?").run(nowIso, row.id);

      if (row.kind === 'storage') {
        const meta = (() => {
          try { return JSON.parse(row.metadata_json || '{}'); } catch { return {}; }
        })();
        const addedBytes = Number(meta.addedBytes || 0);
        const owner = db.prepare('SELECT storageQuotaBytes FROM users WHERE id = ?').get(row.user_id) as any;
        const usedRow = db
          .prepare('SELECT COALESCE(SUM(size), 0) as usedBytes FROM user_storage_files WHERE userId = ?')
          .get(row.user_id) as any;
        const usedBytes = Number(usedRow?.usedBytes || 0);
        const currentQuota = Number(owner?.storageQuotaBytes || FREE_STORAGE_QUOTA_BYTES);
        const candidateQuota = Math.max(FREE_STORAGE_QUOTA_BYTES, currentQuota - addedBytes);
        if (usedBytes > candidateQuota) {
          throw new Error(
            `Cannot refund storage expansion while ${(usedBytes / (1024 * 1024)).toFixed(1)} MB of files remain stored. Delete files below ${(candidateQuota / (1024 * 1024 * 1024)).toFixed(2)} GB first.`
          );
        }
        db.prepare('UPDATE users SET storageQuotaBytes = ?, billing_updated_at = ? WHERE id = ?').run(candidateQuota, nowIso, row.user_id);
      } else if (row.kind === 'sms_bundle') {
        const meta = (() => {
          try { return JSON.parse(row.metadata_json || '{}'); } catch { return {}; }
        })();
        const addedSms = Number(meta.addedSmsCredits || 0);
        const owner = db.prepare('SELECT sms_credits FROM users WHERE id = ?').get(row.user_id) as any;
        const currSms = Number(owner?.sms_credits ?? 0);
        const nextSms = Math.max(0, currSms - addedSms);
        db.prepare('UPDATE users SET sms_credits = ?, billing_updated_at = ? WHERE id = ?').run(nextSms, nowIso, row.user_id);
      } else if (row.kind === 'protocol') {
        db.prepare("UPDATE users SET subscription_tier = 'free', credits = 400, billing_updated_at = ? WHERE id = ?").run(nowIso, row.user_id);
      }
    });

    try {
      runRefund();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }

    logAudit(req.user.id, req.user.email, req.user.role, 'BILLING_REFUND_PROCESSED', row.invoice_number, `Refunded UGX ${Number(row.amount_ugx).toLocaleString()}`);
    if (dispatchNeuralSignal) {
      dispatchNeuralSignal({
        channel: 'billing_ledger',
        eventType: 'billing',
        senderId: req.user.id,
        senderName: req.user.displayName,
        senderRole: req.user.role,
        targetRole: 'admin',
        targetUserId: row.user_id,
        subject: `Billing Refund Issued (${row.invoice_number})`,
        content: `Transaction ${row.invoice_number} (UGX ${Number(row.amount_ugx).toLocaleString()}) refunded cleanly.`,
        priority: 'urgent'
      });
    }

    const updated = db.prepare('SELECT * FROM billing_transactions WHERE id = ?').get(row.id);
    res.json({
      success: true,
      transaction: formatTxRow(updated),
      user: readUserBillingProjection(row.user_id)
    });
  });

  // 8. Payment Link Generator
  app.post('/api/billing/create-payment-link', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const { planId = 'catalyst' } = req.body || {};
    const ref = `DOC-LINK-${Date.now().toString(36).toUpperCase()}`;
    res.json({
      success: true,
      link: `/billing?checkout=${encodeURIComponent(String(planId))}&ref=${ref}`,
      reference: ref
    });
  });

  // 9. Export Transaction Ledger CSV
  app.get('/api/billing/export', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Authenticated account required to export billing ledger.' });
    }
    const rows = req.user.role === 'admin'
      ? (db.prepare('SELECT * FROM billing_transactions ORDER BY created_at DESC LIMIT 500').all() as any[])
      : (db.prepare('SELECT * FROM billing_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 500').all(req.user.id) as any[]);

    const header = [
      'Invoice Number',
      'Date (UTC)',
      'Account Name',
      'Account Email',
      'Category',
      'Package',
      'Subtotal (UGX)',
      'VAT 18% (UGX)',
      'Total (UGX)',
      'Payment Method',
      'Phone / Ref',
      'Status',
      'HMAC Signature Prefix'
    ].join(',');

    const lines = rows.map((r) =>
      [
        csvCell(r.invoice_number),
        csvCell(r.created_at),
        csvCell(r.user_name),
        csvCell(r.user_email),
        csvCell(r.kind),
        csvCell(r.item_name),
        csvCell(r.subtotal_ugx),
        csvCell(r.vat_ugx),
        csvCell(r.amount_ugx),
        csvCell(r.payment_method),
        csvCell(r.payer_phone || r.external_ref || ''),
        csvCell(r.status),
        csvCell(String(r.receipt_hmac || '').slice(0, 16))
      ].join(',')
    );

    const csv = [header, ...lines].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="doctorian-billing-ledger-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  });
}
