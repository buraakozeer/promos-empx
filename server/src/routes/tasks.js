import express from 'express';
import jwt from 'jsonwebtoken';
import Task from '../models/Task.js';
import TaskNote from '../models/TaskNote.js';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token bulunamadı.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz token.' });
  }
};

router.use(authMiddleware);

const shapeTask = (task) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  assignedTo: task.assignedTo.map(id => id.toString()),
  createdBy: task.createdBy.toString(),
  createdAt: task.createdAt.toISOString().split('T')[0],
  dueDate: task.dueDate.toISOString().split('T')[0],
  endDate: task.endDate ? task.endDate.toISOString().split('T')[0] : null,
  status: task.status,
  completedBy: task.completedBy.map(id => id.toString()),
  subTasks: task.subTasks.map(st => ({
    userId: st.userId.toString(),
    detail: st.detail
  })),
  extensionRequest: (task.extensionRequest && task.extensionRequest.requestedDate) ? {
    requestedDate: task.extensionRequest.requestedDate?.toISOString().split('T')[0],
    reason: task.extensionRequest.reason,
    status: task.extensionRequest.status
  } : null,
  attachment: task.attachment || null,
  readBy: task.readBy.map(id => id.toString()),
  notes: []
});

router.get('/tasks', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    let query = {};
    
    if (user.role !== 'admin') {
      query = {
        $or: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    
    const tasksWithNotes = await Promise.all(tasks.map(async (task) => {
      const notes = await TaskNote.find({ taskId: task._id }).sort({ createdAt: 1 });
      const shapedTask = shapeTask(task);
      shapedTask.notes = notes.map(note => ({
        id: note._id.toString(),
        userId: note.userId.toString(),
        text: note.text,
        date: note.createdAt.toLocaleString('tr-TR')
      }));
      return shapedTask;
    }));

    res.json(tasksWithNotes);
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ message: 'Görevler getirilemedi.' });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, assignedTo, dueDate, endDate, subTasks, attachment, isRecurring, recurrenceType, recurrenceCount } = req.body;

    if (!title || !assignedTo || assignedTo.length === 0 || !dueDate) {
      return res.status(400).json({ message: 'Başlık, atanan kişiler ve son tarih zorunludur.' });
    }

    const tasksToCreate = [];
    const loopCount = isRecurring ? parseInt(recurrenceCount) || 1 : 1;

    for (let i = 0; i < loopCount; i++) {
      const currentDueDate = new Date(dueDate);
      
      if (isRecurring && i > 0) {
        if (recurrenceType === 'daily') currentDueDate.setDate(currentDueDate.getDate() + i);
        if (recurrenceType === 'weekly') currentDueDate.setDate(currentDueDate.getDate() + (i * 7));
        if (recurrenceType === 'monthly') currentDueDate.setMonth(currentDueDate.getMonth() + i);
      }

      const currentTitle = isRecurring && loopCount > 1 
        ? `${title} (${i + 1}/${loopCount})` 
        : title;

      const taskData = {
        title: currentTitle,
        description: description || '',
        assignedTo,
        createdBy: userId,
        dueDate: currentDueDate,
        endDate: endDate ? new Date(endDate) : null,
        status: 'pending',
        completedBy: [],
        subTasks: subTasks || [],
        attachment: attachment || null,
        readBy: [userId],
        isRecurring: isRecurring || false,
        recurrenceType: recurrenceType || null
      };

      tasksToCreate.push(taskData);
    }

    const createdTasks = await Task.insertMany(tasksToCreate);
    
    const shapedTasks = createdTasks.map(task => {
      const shaped = shapeTask(task);
      shaped.notes = [];
      return shaped;
    });

    res.json(shapedTasks);
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ message: 'Görev oluşturulamadı.' });
  }
});

router.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı.' });

    const notes = await TaskNote.find({ taskId: id }).sort({ createdAt: 1 });
    const shapedTask = shapeTask(task);
    shapedTask.notes = notes.map(note => ({
      id: note._id.toString(),
      userId: note.userId.toString(),
      text: note.text,
      date: note.createdAt.toLocaleString('tr-TR')
    }));

    res.json(shapedTask);
  } catch (err) {
    console.error('GET /tasks/:id error:', err);
    res.status(500).json({ message: 'Görev getirilemedi.' });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, dueDate, endDate, subTasks, attachment } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (subTasks) updateData.subTasks = subTasks;
    if (attachment !== undefined) updateData.attachment = attachment;

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı.' });

    const notes = await TaskNote.find({ taskId: id }).sort({ createdAt: 1 });
    const shapedTask = shapeTask(task);
    shapedTask.notes = notes.map(note => ({
      id: note._id.toString(),
      userId: note.userId.toString(),
      text: note.text,
      date: note.createdAt.toLocaleString('tr-TR')
    }));

    res.json(shapedTask);
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ message: 'Görev güncellenemedi.' });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await Task.findByIdAndDelete(id);
    await TaskNote.deleteMany({ taskId: id });

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err);
    res.status(500).json({ message: 'Görev silinemedi.' });
  }
});

router.post('/tasks/:id/notes', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: 'Not metni zorunludur.' });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı.' });

    const note = await TaskNote.create({
      taskId: id,
      userId,
      text
    });

    await Task.findByIdAndUpdate(id, {
      readBy: [userId]
    });

    res.json({
      id: note._id.toString(),
      userId: note.userId.toString(),
      text: note.text,
      date: note.createdAt.toLocaleString('tr-TR')
    });
  } catch (err) {
    console.error('POST /tasks/:id/notes error:', err);
    res.status(500).json({ message: 'Not eklenemedi.' });
  }
});

router.put('/tasks/:id/complete', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı.' });

    if (!task.completedBy.includes(userId)) {
      task.completedBy.push(userId);
    }

    const allCompleted = task.assignedTo.every(uid => 
      task.completedBy.some(cid => cid.toString() === uid.toString())
    );

    if (allCompleted) {
      task.status = 'completed';
    }

    await task.save();

    const notes = await TaskNote.find({ taskId: id }).sort({ createdAt: 1 });
    const shapedTask = shapeTask(task);
    shapedTask.notes = notes.map(note => ({
      id: note._id.toString(),
      userId: note.userId.toString(),
      text: note.text,
      date: note.createdAt.toLocaleString('tr-TR')
    }));

    res.json(shapedTask);
  } catch (err) {
    console.error('PUT /tasks/:id/complete error:', err);
    res.status(500).json({ message: 'Görev tamamlanamadı.' });
  }
});

router.post('/tasks/:id/extension', async (req, res) => {
  try {
    const { id } = req.params;
    const { requestedDate, reason } = req.body;

    if (!requestedDate || !reason) {
      return res.status(400).json({ message: 'Tarih ve sebep zorunludur.' });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        extensionRequest: {
          requestedDate: new Date(requestedDate),
          reason,
          status: 'pending'
        }
      },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: 'Görev bulunamadı.' });

    const notes = await TaskNote.find({ taskId: id }).sort({ createdAt: 1 });
    const shapedTask = shapeTask(task);
    shapedTask.notes = notes.map(note => ({
      id: note._id.toString(),
      userId: note.userId.toString(),
      text: note.text,
      date: note.createdAt.toLocaleString('tr-TR')
    }));

    res.json(shapedTask);
  } catch (err) {
    console.error('POST /tasks/:id/extension error:', err);
    res.status(500).json({ message: 'Erteleme talebi oluşturulamadı.' });
  }
});

router.put('/tasks/:id/extension', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, newDate } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı.' });

    if (decision === 'rejected') {
      task.extensionRequest.status = 'rejected';
    } else if (decision === 'approved') {
      task.extensionRequest.status = 'approved';
      task.dueDate = new Date(newDate || task.extensionRequest.requestedDate);
    }

    await task.save();

    const notes = await TaskNote.find({ taskId: id }).sort({ createdAt: 1 });
    const shapedTask = shapeTask(task);
    shapedTask.notes = notes.map(note => ({
      id: note._id.toString(),
      userId: note.userId.toString(),
      text: note.text,
      date: note.createdAt.toLocaleString('tr-TR')
    }));

    res.json(shapedTask);
  } catch (err) {
    console.error('PUT /tasks/:id/extension error:', err);
    res.status(500).json({ message: 'Erteleme talebi güncellenemedi.' });
  }
});

router.put('/tasks/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Görev bulunamadı.' });

    if (!task.readBy.includes(userId)) {
      task.readBy.push(userId);
      await task.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('PUT /tasks/:id/read error:', err);
    res.status(500).json({ message: 'Okundu işaretlenemedi.' });
  }
});

export default router;
