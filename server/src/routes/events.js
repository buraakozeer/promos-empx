import express from 'express';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import { verifyToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requirePermission('agenda'));

const shapeEvent = (e) => ({
  id: e._id.toString(),
  title: e.title,
  date: e.date,
  time: e.time,
  endTime: e.endTime,
  type: e.type,
  description: e.description,
  participants: e.participants || [],
  unreadBy: e.unreadBy || [],
});

// Tüm etkinlikleri listele (ileride participant filtrelenebilir)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1, time: 1 });
    res.json(events.map(shapeEvent));
  } catch (err) {
    console.error('GET /events error:', err);
    res.status(500).json({ message: 'Etkinlikler getirilemedi.' });
  }
});

// Yeni etkinlik oluştur
router.post('/', async (req, res) => {
  try {
    const { title, date, time, endTime, type, description, participants, unreadBy } = req.body;
    if (!title || !date || !time || !endTime) {
      return res.status(400).json({ message: 'Başlık, tarih ve saat alanları zorunludur.' });
    }

    const ev = await Event.create({
      title,
      date,
      time,
      endTime,
      type,
      description,
      participants: participants || [],
      unreadBy: unreadBy || [],
    });

    // Katılımcılar için bildirim oluştur
    try {
      const participantsArr = participants || [];
      const notifDocs = participantsArr.map((participantId) => ({
        userId: String(participantId),
        type: 'event',
        title,
        message: description || 'Yeni ajanda etkinliği',
        link: '/agenda',
      }));
      if (notifDocs.length > 0) {
        await Notification.insertMany(notifDocs, { ordered: false }).catch(() => {});
      }
    } catch (e) {
      console.error('Bildirim oluşturulurken hata oluştu (event create):', e.message);
    }

    res.status(201).json(shapeEvent(ev));
  } catch (err) {
    console.error('POST /events error:', err);
    res.status(500).json({ message: 'Etkinlik oluşturulamadı.' });
  }
});

// Etkinlik güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, endTime, type, description, participants, unreadBy } = req.body;

    const ev = await Event.findByIdAndUpdate(
      id,
      { title, date, time, endTime, type, description, participants, unreadBy },
      { new: true }
    );

    if (!ev) return res.status(404).json({ message: 'Etkinlik bulunamadı.' });

    res.json(shapeEvent(ev));
  } catch (err) {
    console.error('PUT /events/:id error:', err);
    res.status(500).json({ message: 'Etkinlik güncellenemedi.' });
  }
});

// Etkinlik sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ev = await Event.findByIdAndDelete(id);
    if (!ev) return res.status(404).json({ message: 'Etkinlik bulunamadı.' });
    res.status(204).end();
  } catch (err) {
    console.error('DELETE /events/:id error:', err);
    res.status(500).json({ message: 'Etkinlik silinemedi.' });
  }
});

export default router;
