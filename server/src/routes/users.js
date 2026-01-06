import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { verifyToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Mevcut kullanıcı bilgisi (token'dan) - admin_panel yetkisi gerektirmez
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    res.json({
      id: user._id.toString(),
      name: user.name,
      surname: user.surname,
      email: user.email,
      permissions: user.permissions,
      role: user.permissions.includes('admin_panel') ? 'admin' : 'staff'
    });
  } catch (err) {
    console.error('GET /users/me error:', err);
    res.status(500).json({ message: 'Kullanıcı bilgisi alınamadı.' });
  }
});

// Tüm kullanıcıların temel bilgileri (herkes erişebilir) - görev atama listesi için
router.get('/list', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('name surname email');
    res.json(users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      surname: u.surname,
      email: u.email,
    })));
  } catch (err) {
    console.error('GET /users/list error:', err);
    res.status(500).json({ message: 'Kullanıcı listesi alınamadı.' });
  }
});

router.use(verifyToken, requirePermission('admin_panel'));

// Tüm kullanıcıları listele
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users.map(u => ({
      id: u._id.toString(),
      personnelId: u.personnelId || '',
      name: u.name,
      surname: u.surname,
      email: u.email,
      permissions: u.permissions,
    })));
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ message: 'Kullanıcılar getirilemedi.' });
  }
});

// Yeni kullanıcı oluştur
router.post('/', async (req, res) => {
  try {
    const { personnelId, name, surname, email, password, permissions = [] } = req.body;
    if (!name || !surname || !email || !password) {
      return res.status(400).json({ message: 'İsim, soyisim, e-posta ve şifre zorunludur.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı.' });

    if (personnelId) {
      const existingId = await User.findOne({ personnelId });
      if (existingId) return res.status(409).json({ message: 'Bu personel ID zaten kullanılıyor.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ personnelId: personnelId || undefined, name, surname, email, passwordHash: hash, permissions });

    res.status(201).json({
      id: user._id.toString(),
      personnelId: user.personnelId || '',
      name: user.name,
      surname: user.surname,
      email: user.email,
      permissions: user.permissions,
    });
  } catch (err) {
    console.error('POST /users error:', err);
    res.status(500).json({ message: 'Kullanıcı oluşturulamadı.' });
  }
});

// Kullanıcı güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, personnelId } = req.body;
    
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Yetkiler gerekli.' });
    }

    // Check if personnelId is being changed and if it's already in use
    if (personnelId) {
      const existingUser = await User.findOne({ personnelId, _id: { $ne: id } });
      if (existingUser) {
        return res.status(409).json({ message: 'Bu personel ID zaten kullanılıyor.' });
      }
    }

    const updateData = { permissions };
    if (personnelId !== undefined) {
      updateData.personnelId = personnelId || null;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    res.json({
      id: user._id.toString(),
      personnelId: user.personnelId || '',
      name: user.name,
      surname: user.surname,
      email: user.email,
      permissions: user.permissions,
    });
  } catch (err) {
    console.error('PUT /users/:id error:', err);
    res.status(500).json({ message: 'Kullanıcı güncellenemedi.' });
  }
});

// Kullanıcı sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /users/:id error:', err);
    res.status(500).json({ message: 'Kullanıcı silinemedi.' });
  }
});

export default router;
