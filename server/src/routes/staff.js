import express from 'express';
import Staff from '../models/Staff.js';
import { verifyToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requirePermission('staff'));

const shapeStaff = (s) => ({
  id: s._id.toString(),
  name: s.name,
  surname: s.surname,
  tcNo: s.tcNo,
  birthDate: s.birthDate,
  startDate: s.startDate,
  manager: s.manager,
  salary: s.salary,
  status: s.status,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

// Listele
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff.map(shapeStaff));
  } catch (err) {
    console.error('GET /staff error:', err);
    res.status(500).json({ message: 'Personel listesi getirilemedi.' });
  }
});

// Oluştur
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const staff = await Staff.create(body);
    res.status(201).json(shapeStaff(staff));
  } catch (err) {
    console.error('POST /staff error:', err);
    res.status(500).json({ message: 'Personel oluşturulamadı.' });
  }
});

// Güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    body.updatedAt = new Date();
    const staff = await Staff.findByIdAndUpdate(id, body, { new: true });
    if (!staff) return res.status(404).json({ message: 'Personel bulunamadı.' });
    res.json(shapeStaff(staff));
  } catch (err) {
    console.error('PUT /staff/:id error:', err);
    res.status(500).json({ message: 'Personel güncellenemedi.' });
  }
});

// Sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Personel bulunamadı.' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /staff/:id error:', err);
    res.status(500).json({ message: 'Personel silinemedi.' });
  }
});

export default router;
