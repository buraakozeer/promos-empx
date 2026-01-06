import express from 'express';
import TimeEntry from '../models/TimeEntry.js';
import { verifyToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requirePermission('timekeeping'));

const shapeEntry = (e) => ({
  id: e._id.toString(),
  staffId: e.staffId,
  year: e.year,
  month: e.month,
  attendance: e.attendance || {},
});

// Belirli yıl/ay için tüm kayıtları listele
router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = {};
    if (year) query.year = Number(year);
    if (month) query.month = Number(month);

    const entries = await TimeEntry.find(query);
    res.json(entries.map(shapeEntry));
  } catch (err) {
    console.error('GET /timeentries error:', err);
    res.status(500).json({ message: 'Puantaj kayıtları getirilemedi.' });
  }
});

// Upsert: staffId + year + month kombinasyonu için tek kayıt tut
router.put('/', async (req, res) => {
  try {
    const { staffId, year, month, attendance } = req.body;
    if (!staffId || !year || !month) {
      return res.status(400).json({ message: 'staffId, year ve month zorunludur.' });
    }

    const entry = await TimeEntry.findOneAndUpdate(
      { staffId, year, month },
      { staffId, year, month, attendance: attendance || {} },
      { new: true, upsert: true }
    );

    res.json(shapeEntry(entry));
  } catch (err) {
    console.error('PUT /timeentries error:', err);
    res.status(500).json({ message: 'Puantaj kaydedilemedi.' });
  }
});

export default router;
