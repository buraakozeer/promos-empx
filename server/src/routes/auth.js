import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Seed initial users if collection is empty
async function ensureSeedUsers() {
  const count = await User.countDocuments();
  if (count > 0) return;

  const commonPermissions = ['home', 'agenda', 'work_tracking', 'task_management', 'messages', 'raw_materials', 'products', 'costs', 'staff', 'timekeeping', 'admin_panel', 'settings'];

  const users = [
    { name: 'Sistem', surname: 'Yöneticisi', email: 'admin@sirket.com', password: '123', permissions: commonPermissions },
    { name: 'Emre', surname: 'Güler', email: 'emre@sirket.com', password: '123', permissions: commonPermissions },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await User.create({
      name: u.name,
      surname: u.surname,
      email: u.email,
      passwordHash: hash,
      permissions: u.permissions,
    });
  }

  console.log('Seed users created');
}

ensureSeedUsers().catch((e) => console.error('Seed error:', e));

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre zorunludur.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });

    const payload = { id: user._id.toString(), email: user.email, permissions: user.permissions || [] };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        surname: user.surname,
        email: user.email,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

export default router;
