import express from 'express';
import bcrypt from 'bcryptjs';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import { verifyToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Get company login settings (admin only) - returns email only, not password
router.get('/company-login', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const email = await Settings.getSetting('companyLoginEmail');
    const hasPassword = !!(await Settings.getSetting('companyLoginPasswordHash'));
    res.json({ email: email || '', hasPassword });
  } catch (err) {
    console.error('GET /settings/company-login error:', err);
    res.status(500).json({ message: 'Ayarlar alınamadı.' });
  }
});

// Set company login settings (admin only)
router.put('/company-login', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Company login save request:', { email, hasPassword: !!password });
    
    if (!email) {
      return res.status(400).json({ message: 'E-posta adresi gerekli.' });
    }

    const emailResult = await Settings.setSetting('companyLoginEmail', email);
    console.log('Email saved:', emailResult);
    
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      const hashResult = await Settings.setSetting('companyLoginPasswordHash', hash);
      console.log('Password hash saved:', !!hashResult);
    }

    res.json({ message: 'Şirket giriş bilgileri kaydedildi.', email });
  } catch (err) {
    console.error('PUT /settings/company-login error:', err);
    res.status(500).json({ message: 'Ayarlar kaydedilemedi.' });
  }
});

// Debug: Show all settings (temporary)
router.get('/debug', async (req, res) => {
  try {
    const allSettings = await Settings.find({});
    res.json(allSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify company login (public - no auth required)
router.post('/company-login/verify', async (req, res) => {
  console.log('=== COMPANY LOGIN VERIFY CALLED ===');
  console.log('Request body:', req.body);
  try {
    const { email, password } = req.body;
    
    console.log('Company login verify attempt:', { email });
    
    const storedEmail = await Settings.getSetting('companyLoginEmail');
    const storedHash = await Settings.getSetting('companyLoginPasswordHash');
    
    console.log('Stored settings:', { storedEmail, hasHash: !!storedHash });
    
    if (!storedEmail || !storedHash) {
      console.log('Company login not configured');
      return res.status(404).json({ message: 'Şirket girişi henüz yapılandırılmamış.' });
    }
    
    if (email !== storedEmail) {
      console.log('Email mismatch:', { provided: email, stored: storedEmail });
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }
    
    const isValid = await bcrypt.compare(password, storedHash);
    console.log('Password validation:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }
    
    res.json({ success: true, isCompanyLogin: true });
  } catch (err) {
    console.error('POST /settings/company-login/verify error:', err);
    res.status(500).json({ message: 'Doğrulama hatası.' });
  }
});

// Lookup user by personnel ID (for company login flow)
router.post('/lookup-personnel', async (req, res) => {
  try {
    const { personnelId } = req.body;
    
    if (!personnelId) {
      return res.status(400).json({ message: 'Personel ID gerekli.' });
    }
    
    const user = await User.findOne({ personnelId }).select('name surname email personnelId');
    
    if (!user) {
      return res.status(404).json({ message: 'Bu ID ile kayıtlı personel bulunamadı.' });
    }
    
    res.json({
      id: user._id.toString(),
      personnelId: user.personnelId,
      name: user.name,
      surname: user.surname,
      email: user.email,
    });
  } catch (err) {
    console.error('POST /settings/lookup-personnel error:', err);
    res.status(500).json({ message: 'Personel arama hatası.' });
  }
});

export default router;
