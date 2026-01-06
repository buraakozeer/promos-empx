import express from 'express';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Bildirimler tüm oturum açmış kullanıcılar için geçerli; ekstra permission istemiyoruz.
router.use(verifyToken);

// Aktif kullanıcının bildirimlerini listele (yeni -> eski)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(100);
    res.json(
      notifications.map((n) => ({
        id: n._id.toString(),
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt,
      }))
    );
  } catch (err) {
    console.error('GET /notifications error:', err);
    res.status(500).json({ message: 'Bildirimler getirilemedi.' });
  }
});

// Yeni bildirim oluştur (ileride diğer rotalardan kullanılabilir)
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, link } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ message: 'userId ve title zorunludur.' });
    }

    const notif = await Notification.create({ userId, type, title, message, link });
    res.status(201).json({
      id: notif._id.toString(),
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      read: notif.read,
      createdAt: notif.createdAt,
    });
  } catch (err) {
    console.error('POST /notifications error:', err);
    res.status(500).json({ message: 'Bildirim oluşturulamadı.' });
  }
});

// Tek bildirimi okundu işaretle
router.put('/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Bildirim bulunamadı.' });

    res.json({
      id: notif._id.toString(),
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      read: notif.read,
      createdAt: notif.createdAt,
    });
  } catch (err) {
    console.error('PUT /notifications/:id/read error:', err);
    res.status(500).json({ message: 'Bildirim okundu işaretlenemedi.' });
  }
});

// Tüm bildirimleri okundu işaretle (aktif kullanıcı için)
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /notifications/read-all error:', err);
    res.status(500).json({ message: 'Bildirimler okundu işaretlenemedi.' });
  }
});

export default router;
