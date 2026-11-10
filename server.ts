import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', time: new Date().toISOString(), hospital: 'Mulago National Referral Hospital' });
  });

  // Live Machine & Sensor Stream simulation or data relay
  app.get('/api/sensors/vitals', (req, res) => {
    // Generate realistic fluctuating telemetry
    const heartRate = Math.floor(72 + (Math.sin(Date.now() / 3000) * 8) + (Math.random() * 4));
    const spo2 = Math.min(100, Math.floor(98 + (Math.sin(Date.now() / 5000) * 1.5)));
    const bpSystolic = Math.floor(120 + Math.sin(Date.now() / 8000) * 6);
    const bpDiastolic = Math.floor(80 + Math.sin(Date.now() / 8000) * 4);
    const temperature = (36.8 + Math.sin(Date.now() / 10000) * 0.3).toFixed(1);
    const respRate = Math.floor(16 + Math.sin(Date.now() / 4000) * 2);

    res.json({
      timestamp: Date.now(),
      vitals: {
        heartRate,
        spo2,
        bloodPressure: `${bpSystolic}/${bpDiastolic}`,
        temperature: parseFloat(temperature),
        respiratoryRate: respRate,
        leadIIECG: Math.sin(Date.now() / 150) * 1.2 + (Math.random() * 0.1)
      },
      machineStatus: {
        connected: true,
        deviceType: 'Mindray BeneVision / USB Telemetry',
        battery: 94,
        leadQuality: 'Good'
      }
    });
  });

  // Live Pharmacy & Clinic Advertisements endpoint
  let pharmacyAds = [
    {
      id: 'ad-1',
      title: 'Coartem (Artemether-Lumefantrine 20/120mg)',
      category: 'Anti-Malarial',
      clinicOrPharmacy: 'Guardian Pharmacy - Kampala Road Branch',
      location: 'Kampala Central, Uganda',
      phone: '+256 700 123456',
      whatsapp: '256700123456',
      priceUgx: 14000,
      description: 'First-line ACT for uncomplicated P. falciparum malaria. Authentic Ministry of Health verified batch.',
      stockStatus: 'In Stock (500+ packs)',
      verified: true,
      postedAt: 'Just now'
    },
    {
      id: 'ad-2',
      title: 'Full Body Health Screening & Diabetes Checkup',
      category: 'Clinical Service',
      clinicOrPharmacy: 'Nakasero Hospital Outpatient Clinic',
      location: 'Akii Bua Road, Nakasero, Kampala',
      phone: '+256 312 531400',
      whatsapp: '256312531400',
      priceUgx: 85000,
      description: 'Comprehensive Fasting Blood Sugar, HbA1c, Lipid Profile, and Doctor consultation.',
      stockStatus: 'Open Today 24/7',
      verified: true,
      postedAt: '12 mins ago'
    },
    {
      id: 'ad-3',
      title: 'Omeprazole 20mg Capsules (Strip of 14)',
      category: 'Digestive Health',
      clinicOrPharmacy: 'Friecca Pharmacy Wandegeya',
      location: 'Near Makerere Main Gate, Kampala',
      phone: '+256 414 540600',
      whatsapp: '256414540600',
      priceUgx: 4500,
      description: 'Instant acid reflux & peptic ulcer relief. Free delivery within Wandegeya and Makerere.',
      stockStatus: 'Fast Delivery',
      verified: true,
      postedAt: '25 mins ago'
    }
  ];

  app.get('/api/ads', (req, res) => {
    res.json({ ads: pharmacyAds });
  });

  app.post('/api/ads', (req, res) => {
    const newAd = {
      id: 'ad-' + Date.now(),
      title: req.body.title || 'Untitled Product',
      category: req.body.category || 'General Medicine',
      clinicOrPharmacy: req.body.clinicOrPharmacy || 'Community Clinic Uganda',
      location: req.body.location || 'Kampala, Uganda',
      phone: req.body.phone || '+256 772 000000',
      whatsapp: req.body.whatsapp || '256772000000',
      priceUgx: parseInt(req.body.priceUgx, 10) || 5000,
      description: req.body.description || 'Genuine pharmaceutical product verified by NDA.',
      stockStatus: req.body.stockStatus || 'Available Now',
      verified: true,
      postedAt: 'Just now'
    };
    pharmacyAds.unshift(newAd);
    res.json({ success: true, ad: newAd });
  });

  // In development, mount Vite middleware for rapid HMR & SSR
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Doctorian AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
