import express from 'express';
import Chat from '../models/Chat.js';
import Notification from '../models/Notification.js';
import { verifyToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requirePermission('messages'));

const shapeChat = (c) => ({
  id: c._id.toString(),
  subject: c.subject,
  participants: c.participants || [],
  messages: (c.messages || []).map((m, idx) => ({
    id: idx, // frontend already generates its own ids, this is mainly for key usage
    senderId: m.senderId,
    text: m.text,
    fileUrl: m.fileUrl,
    fileType: m.fileType,
    fileName: m.fileName,
    time: m.time,
  })),
  unreadBy: c.unreadBy || [],
});

// Aktif kullanıcının içinde olduğu sohbetleri getir
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
    res.json(chats.map(shapeChat));
  } catch (err) {
    console.error('GET /chats error:', err);
    res.status(500).json({ message: 'Sohbetler getirilemedi.' });
  }
});

// Yeni sohbet oluştur
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, participants } = req.body;

    if (!subject || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'Konu ve katılımcılar zorunludur.' });
    }

    const uniqueParticipants = Array.from(new Set([...participants, userId]));
    const unreadBy = uniqueParticipants.filter((id) => id !== userId);

    const chat = await Chat.create({
      subject,
      participants: uniqueParticipants,
      messages: [],
      unreadBy,
    });

    res.status(201).json(shapeChat(chat));
  } catch (err) {
    console.error('POST /chats error:', err);
    res.status(500).json({ message: 'Sohbet oluşturulamadı.' });
  }
});

// Mesaj gönder
router.post('/:id/messages', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { text, fileUrl, fileType, fileName, time } = req.body;

    if (!text && !fileUrl) {
      return res.status(400).json({ message: 'Metin veya dosya zorunludur.' });
    }

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: 'Sohbet bulunamadı.' });

    const msgTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    chat.messages.push({
      senderId: userId,
      text: text || '',
      fileUrl: fileUrl || '',
      fileType: fileType || '',
      fileName: fileName || '',
      time: msgTime,
    });

    const otherParticipants = chat.participants.filter((p) => p !== userId);
    chat.unreadBy = Array.from(new Set([...(chat.unreadBy || []), ...otherParticipants]));

    await chat.save();

    // Diğer katılımcılar için bildirim oluştur
    try {
      const notifDocs = otherParticipants.map((participantId) => ({
        userId: String(participantId),
        type: 'chat',
        title: chat.subject,
        message: text || (fileName ? `Dosya: ${fileName}` : 'Yeni mesaj'),
        link: '/messages',
      }));
      if (notifDocs.length > 0) {
        await Notification.insertMany(notifDocs, { ordered: false }).catch(() => {});
      }
    } catch (e) {
      console.error('Bildirim oluşturulurken hata oluştu (chat message):', e.message);
    }

    res.json(shapeChat(chat));
  } catch (err) {
    console.error('POST /chats/:id/messages error:', err);
    res.status(500).json({ message: 'Mesaj gönderilemedi.' });
  }
});

// Sohbeti okundu işaretle (aktif kullanıcı için)
router.put('/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: 'Sohbet bulunamadı.' });

    chat.unreadBy = (chat.unreadBy || []).filter((u) => u !== userId);
    await chat.save();

    res.json(shapeChat(chat));
  } catch (err) {
    console.error('PUT /chats/:id/read error:', err);
    res.status(500).json({ message: 'Okundu bilgisi güncellenemedi.' });
  }
});

// Tüm sohbetleri okundu işaretle (aktif kullanıcı için)
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.user.id;

    await Chat.updateMany(
      { participants: userId, unreadBy: userId },
      { $pull: { unreadBy: userId } }
    );

    const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
    res.json(chats.map(shapeChat));
  } catch (err) {
    console.error('PUT /chats/read-all error:', err);
    res.status(500).json({ message: 'Sohbetler okundu işaretlenemedi.' });
  }
});

export default router;
