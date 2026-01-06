import express from 'express';
import { verifyToken, requirePermission } from '../middleware/auth.js';
import KanbanWorkspace from '../models/KanbanWorkspace.js';
import KanbanBoard from '../models/KanbanBoard.js';
import KanbanList from '../models/KanbanList.js';
import KanbanCard from '../models/KanbanCard.js';
import KanbanActivity from '../models/KanbanActivity.js';
import KanbanComment from '../models/KanbanComment.js';
import KanbanLabel from '../models/KanbanLabel.js';
import KanbanChecklist from '../models/KanbanChecklist.js';
import User from '../models/User.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const createKanbanRoutes = (io) => {
  const router = express.Router();

  router.use(verifyToken, requirePermission('work_tracking'));

  const emitBoardUpdated = (boardId, payload = {}) => {
    if (!io || !boardId) return;
    io.to(`kanban:board:${boardId}`).emit('kanban:updated', { boardId, ...payload });
  };

  const logActivity = async ({ req, entityType, entityId = null, action, workspaceId = null, boardId = null, message = '', meta = {} }) => {
    try {
      await KanbanActivity.create({
        ownerUserId: req.user.id,
        workspaceId,
        boardId,
        entityType,
        entityId,
        action,
        message,
        meta,
      });
    } catch (err) {
      console.error('KanbanActivity create error:', err);
    }
  };

  const getMemberRole = (members, userId) => {
    if (!Array.isArray(members)) return null;
    const m = members.find((x) => x?.userId?.toString?.() === userId);
    return m?.role || null;
  };

  const canRead = (role) => role === 'owner' || role === 'editor' || role === 'viewer';
  const canWrite = (role) => role === 'owner' || role === 'editor';
  const canManage = (role) => role === 'owner';

  const ensureWorkspaceAccess = async (workspaceId, userId, min = 'read') => {
    const ws = await KanbanWorkspace.findById(workspaceId);
    if (!ws) return { ok: false, status: 404, message: 'Çalışma alanı bulunamadı.' };

    let role = getMemberRole(ws.members, userId);
    if (!role && ws.ownerUserId?.toString?.() === userId) role = 'owner';
    if (!role) {
      const hasBoardMembership = await KanbanBoard.exists({ workspaceId, 'members.userId': userId });
      if (hasBoardMembership) role = 'viewer';
    }
    // Backward compat: if no members array, ownerUserId is owner.

    const ok = min === 'manage' ? canManage(role) : min === 'write' ? canWrite(role) : canRead(role);
    if (!ok) return { ok: false, status: 403, message: 'Bu işlem için yetkiniz yok.' };
    return { ok: true, ws, role };
  };

  const ensureBoardAccess = async (boardId, userId, min = 'read') => {
    const board = await KanbanBoard.findById(boardId);
    if (!board) return { ok: false, status: 404, message: 'Pano bulunamadı.' };

    // Board role overrides, else inherit from workspace
    let role = getMemberRole(board.members, userId);
    if (!role && board.ownerUserId?.toString?.() === userId) role = 'owner';
    if (!role) {
      const wsAccess = await ensureWorkspaceAccess(board.workspaceId, userId, min);
      if (!wsAccess.ok) return wsAccess;
      role = wsAccess.role;
    }

    const ok = min === 'manage' ? canManage(role) : min === 'write' ? canWrite(role) : canRead(role);
    if (!ok) return { ok: false, status: 403, message: 'Bu işlem için yetkiniz yok.' };
    return { ok: true, board, role };
  };

  const ensureListAccess = async (listId, userId, min = 'read') => {
    const list = await KanbanList.findById(listId);
    if (!list) return { ok: false, status: 404, message: 'Liste bulunamadı.' };
    const access = await ensureBoardAccess(list.boardId, userId, min);
    if (!access.ok) return access;
    return { ok: true, list, board: access.board, role: access.role };
  };

  const ensureCardAccess = async (cardId, userId, min = 'read') => {
    const card = await KanbanCard.findById(cardId);
    if (!card) return { ok: false, status: 404, message: 'Kart bulunamadı.' };
    const access = await ensureBoardAccess(card.boardId, userId, min);
    if (!access.ok) return access;
    return { ok: true, card, board: access.board, role: access.role };
  };

  const upsertMember = (members, userId, role) => {
    const uid = userId.toString();
    const next = Array.isArray(members) ? [...members] : [];
    const idx = next.findIndex((m) => m?.userId?.toString?.() === uid);
    if (idx >= 0) next[idx] = { ...next[idx], userId, role };
    else next.push({ userId, role });
    return next;
  };

  const removeMember = (members, userId) => {
    const uid = userId.toString();
    return (Array.isArray(members) ? members : []).filter((m) => m?.userId?.toString?.() !== uid);
  };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');
const kanbanUploadDir = path.join(uploadsRoot, 'kanban');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(kanbanUploadDir, { recursive: true });
      cb(null, kanbanUploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safeOriginal = (file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const stamp = Date.now();
    cb(null, `${stamp}-${safeOriginal}`);
  },
});

const upload = multer({ storage });

const inferFileType = (mimetype = '') => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  return 'file';
};

const toId = (doc) => (doc?._id ? doc._id.toString() : undefined);

const shapeWorkspace = (w) => ({
  id: toId(w),
  name: w.name,
  description: w.description || '',
  order: w.order || 0,
  createdAt: w.createdAt,
  updatedAt: w.updatedAt,
});

const shapeBoard = (b) => ({
  id: toId(b),
  workspaceId: b.workspaceId.toString(),
  name: b.name,
  order: b.order || 0,
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});

const shapeList = (l) => ({
  id: toId(l),
  workspaceId: l.workspaceId.toString(),
  boardId: l.boardId.toString(),
  title: l.title,
  order: l.order || 0,
  createdAt: l.createdAt,
  updatedAt: l.updatedAt,
});

const shapeCard = (c) => ({
  id: toId(c),
  workspaceId: c.workspaceId.toString(),
  boardId: c.boardId.toString(),
  listId: c.listId.toString(),
  title: c.title,
  description: c.description || '',
  fileUrl: c.fileUrl || '',
  fileType: c.fileType || '',
  fileName: c.fileName || '',
  order: c.order || 0,
  assigneeUserId: c.assigneeUserId ? c.assigneeUserId.toString() : null,
  labelIds: (c.labelIds || []).map(id => id.toString()),
  dueDate: c.dueDate || null,
  isArchived: c.isArchived || false,
  archivedAt: c.archivedAt || null,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

async function nextOrder(Model, filter) {
  const last = await Model.findOne(filter).sort({ order: -1 }).select('order').lean();
  return (last?.order ?? -1) + 1;
}

async function reorderDocs(Model, idsInOrder) {
  const ops = idsInOrder.map((id, idx) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: idx } },
    },
  }));
  if (ops.length === 0) return;
  await Model.bulkWrite(ops);
}

router.get('/assignees', async (req, res) => {
  try {
    const users = await User.find().select('name surname email').sort({ createdAt: 1 });
    res.json(
      users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        surname: u.surname,
        email: u.email,
      }))
    );
  } catch (err) {
    console.error('GET /kanban/assignees error:', err);
    res.status(500).json({ message: 'Kullanıcılar getirilemedi.' });
  }
});

// Workspace members
router.get('/workspaces/:id/members', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const access = await ensureWorkspaceAccess(id, userId, 'read');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    res.json((access.ws.members || []).map((m) => ({ userId: m.userId.toString(), role: m.role })));
  } catch (err) {
    console.error('GET /kanban/workspaces/:id/members error:', err);
    res.status(500).json({ message: 'Üyeler getirilemedi.' });
  }
});

router.put('/workspaces/:id/members', async (req, res) => {
  try {
    const actorId = req.user.id;
    const { id } = req.params;
    const { userId, role } = req.body || {};
    if (!userId || !role) return res.status(400).json({ message: 'userId ve role zorunludur.' });
    if (!['owner', 'editor', 'viewer'].includes(role)) return res.status(400).json({ message: 'Geçersiz rol.' });

    const access = await ensureWorkspaceAccess(id, actorId, 'manage');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const nextMembers = upsertMember(access.ws.members || [], userId, role);
    const ws = await KanbanWorkspace.findByIdAndUpdate(id, { members: nextMembers }, { new: true });
    await logActivity({ req, entityType: 'workspace', entityId: ws._id, action: 'member_upsert', workspaceId: ws._id, message: `Çalışma alanı üyesi güncellendi: ${userId} (${role})` });
    res.json(ws.members.map((m) => ({ userId: m.userId.toString(), role: m.role })));
  } catch (err) {
    console.error('PUT /kanban/workspaces/:id/members error:', err);
    res.status(500).json({ message: 'Üye güncellenemedi.' });
  }
});

router.delete('/workspaces/:id/members/:memberUserId', async (req, res) => {
  try {
    const actorId = req.user.id;
    const { id, memberUserId } = req.params;
    const access = await ensureWorkspaceAccess(id, actorId, 'manage');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const nextMembers = removeMember(access.ws.members || [], memberUserId);
    const ws = await KanbanWorkspace.findByIdAndUpdate(id, { members: nextMembers }, { new: true });
    await logActivity({ req, entityType: 'workspace', entityId: ws._id, action: 'member_remove', workspaceId: ws._id, message: `Çalışma alanı üyesi çıkarıldı: ${memberUserId}` });
    res.json(ws.members.map((m) => ({ userId: m.userId.toString(), role: m.role })));
  } catch (err) {
    console.error('DELETE /kanban/workspaces/:id/members/:memberUserId error:', err);
    res.status(500).json({ message: 'Üye silinemedi.' });
  }
});

// Board members
router.get('/boards/:id/members', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const access = await ensureBoardAccess(id, userId, 'read');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    res.json((access.board.members || []).map((m) => ({ userId: m.userId.toString(), role: m.role })));
  } catch (err) {
    console.error('GET /kanban/boards/:id/members error:', err);
    res.status(500).json({ message: 'Üyeler getirilemedi.' });
  }
});

router.put('/boards/:id/members', async (req, res) => {
  try {
    const actorId = req.user.id;
    const { id } = req.params;
    const { userId, role } = req.body || {};
    if (!userId || !role) return res.status(400).json({ message: 'userId ve role zorunludur.' });
    if (!['owner', 'editor', 'viewer'].includes(role)) return res.status(400).json({ message: 'Geçersiz rol.' });

    const access = await ensureBoardAccess(id, actorId, 'manage');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const nextMembers = upsertMember(access.board.members || [], userId, role);
    const board = await KanbanBoard.findByIdAndUpdate(id, { members: nextMembers }, { new: true });

    // Ensure user can also discover the workspace (workspaces list is the entrypoint in UI)
    try {
      const ws = await KanbanWorkspace.findById(board.workspaceId);
      if (ws && ws.ownerUserId?.toString?.() !== userId.toString()) {
        const nextWsMembers = upsertMember(ws.members || [], userId, role);
        await KanbanWorkspace.findByIdAndUpdate(ws._id, { members: nextWsMembers }, { new: true });
      }
    } catch (e) {
      console.error('Kanban workspace member auto-upsert error:', e);
    }

    await logActivity({ req, entityType: 'board', entityId: board._id, action: 'member_upsert', workspaceId: board.workspaceId, boardId: board._id, message: `Pano üyesi güncellendi: ${userId} (${role})` });
    emitBoardUpdated(board._id.toString(), { type: 'board:member' });
    res.json(board.members.map((m) => ({ userId: m.userId.toString(), role: m.role })));
  } catch (err) {
    console.error('PUT /kanban/boards/:id/members error:', err);
    res.status(500).json({ message: 'Üye güncellenemedi.' });
  }
});

router.delete('/boards/:id/members/:memberUserId', async (req, res) => {
  try {
    const actorId = req.user.id;
    const { id, memberUserId } = req.params;
    const access = await ensureBoardAccess(id, actorId, 'manage');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const nextMembers = removeMember(access.board.members || [], memberUserId);
    const board = await KanbanBoard.findByIdAndUpdate(id, { members: nextMembers }, { new: true });
    await logActivity({ req, entityType: 'board', entityId: board._id, action: 'member_remove', workspaceId: board.workspaceId, boardId: board._id, message: `Pano üyesi çıkarıldı: ${memberUserId}` });
    emitBoardUpdated(board._id.toString(), { type: 'board:member' });
    res.json(board.members.map((m) => ({ userId: m.userId.toString(), role: m.role })));
  } catch (err) {
    console.error('DELETE /kanban/boards/:id/members/:memberUserId error:', err);
    res.status(500).json({ message: 'Üye silinemedi.' });
  }
});

router.get('/workspaces', async (req, res) => {
  try {
    const userId = req.user.id;

    const directWorkspaces = await KanbanWorkspace.find({
      $or: [{ ownerUserId: userId }, { 'members.userId': userId }],
    }).sort({ order: 1, createdAt: 1 });

    const memberBoards = await KanbanBoard.find({ 'members.userId': userId })
      .select('workspaceId')
      .lean();
    const workspaceIdsFromBoards = Array.from(
      new Set((memberBoards || []).map((b) => b.workspaceId?.toString?.()).filter(Boolean))
    );

    const boardWorkspaces = workspaceIdsFromBoards.length
      ? await KanbanWorkspace.find({ _id: { $in: workspaceIdsFromBoards } }).sort({ order: 1, createdAt: 1 })
      : [];

    const byId = new Map();
    for (const ws of [...directWorkspaces, ...boardWorkspaces]) {
      byId.set(ws._id.toString(), ws);
    }

    const merged = Array.from(byId.values()).sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    res.json(merged.map(shapeWorkspace));
  } catch (err) {
    console.error('GET /kanban/workspaces error:', err);
    res.status(500).json({ message: 'Çalışma alanları getirilemedi.' });
  }
});

router.post('/workspaces', async (req, res) => {
  try {
    const ownerUserId = req.user.id;
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ message: 'İsim zorunludur.' });

    const order = await nextOrder(KanbanWorkspace, { ownerUserId });
    const ws = await KanbanWorkspace.create({
      ownerUserId,
      members: [{ userId: ownerUserId, role: 'owner' }],
      name,
      description: description || '',
      order,
    });

    await logActivity({ req, entityType: 'workspace', entityId: ws._id, action: 'create', workspaceId: ws._id, message: `Çalışma alanı oluşturuldu: ${ws.name}` });
    res.status(201).json(shapeWorkspace(ws));
  } catch (err) {
    console.error('POST /kanban/workspaces error:', err);
    res.status(500).json({ message: 'Çalışma alanı oluşturulamadı.' });
  }
});

router.put('/workspaces/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const access = await ensureWorkspaceAccess(id, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const body = req.body || {};
    delete body.ownerUserId;
    delete body.members;

    const ws = await KanbanWorkspace.findByIdAndUpdate(id, body, { new: true });
    if (!ws) return res.status(404).json({ message: 'Çalışma alanı bulunamadı.' });
    res.json(shapeWorkspace(ws));
  } catch (err) {
    console.error('PUT /kanban/workspaces/:id error:', err);
    res.status(500).json({ message: 'Çalışma alanı güncellenemedi.' });
  }
});

router.delete('/workspaces/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const access = await ensureWorkspaceAccess(id, userId, 'manage');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const ws = await KanbanWorkspace.findByIdAndDelete(id);
    if (!ws) return res.status(404).json({ message: 'Çalışma alanı bulunamadı.' });

    await Promise.all([
      KanbanBoard.deleteMany({ workspaceId: id }),
      KanbanList.deleteMany({ workspaceId: id }),
      KanbanCard.deleteMany({ workspaceId: id }),
    ]);

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /kanban/workspaces/:id error:', err);
    res.status(500).json({ message: 'Çalışma alanı silinemedi.' });
  }
});

// Boards
router.get('/workspaces/:workspaceId/boards', async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;

    const access = await ensureWorkspaceAccess(workspaceId, userId, 'read');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const boards = await KanbanBoard.find({ workspaceId }).sort({ order: 1, createdAt: 1 });
    const filtered = boards.filter((b) => {
      const role = getMemberRole(b.members, userId) || (b.ownerUserId?.toString?.() === userId ? 'owner' : null);
      if (!Array.isArray(b.members) || b.members.length === 0) return true;
      return !!role;
    });
    res.json(filtered.map(shapeBoard));
  } catch (err) {
    console.error('GET /kanban/workspaces/:workspaceId/boards error:', err);
    res.status(500).json({ message: 'Panolar getirilemedi.' });
  }
});

router.post('/workspaces/:workspaceId/boards', async (req, res) => {
  try {
    const ownerUserId = req.user.id;
    const { workspaceId } = req.params;
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: 'İsim zorunludur.' });

    const access = await ensureWorkspaceAccess(workspaceId, ownerUserId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const order = await nextOrder(KanbanBoard, { workspaceId });
    const board = await KanbanBoard.create({
      ownerUserId,
      workspaceId,
      members: access.ws?.members?.length ? access.ws.members : [{ userId: ownerUserId, role: 'owner' }],
      name,
      order,
    });

    await logActivity({ req, entityType: 'board', entityId: board._id, action: 'create', workspaceId: board.workspaceId, boardId: board._id, message: `Pano oluşturuldu: ${board.name}` });
    emitBoardUpdated(board._id.toString(), { type: 'board:create' });
    res.status(201).json(shapeBoard(board));
  } catch (err) {
    console.error('POST /kanban/workspaces/:workspaceId/boards error:', err);
    res.status(500).json({ message: 'Pano oluşturulamadı.' });
  }
});

router.put('/boards/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const access = await ensureBoardAccess(id, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const body = req.body || {};
    delete body.ownerUserId;
    delete body.workspaceId;
    delete body.members;

    const board = await KanbanBoard.findByIdAndUpdate(id, body, { new: true });
    if (!board) return res.status(404).json({ message: 'Pano bulunamadı.' });

    res.json(shapeBoard(board));
  } catch (err) {
    console.error('PUT /kanban/boards/:id error:', err);
    res.status(500).json({ message: 'Pano güncellenemedi.' });
  }
});

router.delete('/boards/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const access = await ensureBoardAccess(id, userId, 'manage');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const board = await KanbanBoard.findByIdAndDelete(id);
    if (!board) return res.status(404).json({ message: 'Pano bulunamadı.' });

    await logActivity({ req, entityType: 'board', entityId: board._id, action: 'delete', workspaceId: board.workspaceId, boardId: board._id, message: `Pano silindi: ${board.name}` });
    emitBoardUpdated(board._id.toString(), { type: 'board:delete' });

    await Promise.all([
      KanbanList.deleteMany({ boardId: id }),
      KanbanCard.deleteMany({ boardId: id }),
    ]);

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /kanban/boards/:id error:', err);
    res.status(500).json({ message: 'Pano silinemedi.' });
  }
});

// Lists
router.get('/boards/:boardId/lists', async (req, res) => {
  try {
    const userId = req.user.id;
    const { boardId } = req.params;

    const access = await ensureBoardAccess(boardId, userId, 'read');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const lists = await KanbanList.find({ boardId }).sort({ order: 1, createdAt: 1 });
    res.json(lists.map(shapeList));
  } catch (err) {
    console.error('GET /kanban/boards/:boardId/lists error:', err);
    res.status(500).json({ message: 'Listeler getirilemedi.' });
  }
});

router.put('/boards/:boardId/lists/reorder', async (req, res) => {
  try {
    const userId = req.user.id;
    const { boardId } = req.params;
    const { orderedListIds } = req.body || {};
    if (!Array.isArray(orderedListIds)) {
      return res.status(400).json({ message: 'orderedListIds zorunludur.' });
    }

    const access = await ensureBoardAccess(boardId, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });
    const board = access.board;

    const existing = await KanbanList.find({ boardId }).select('_id').lean();
    const existingIds = new Set(existing.map((d) => d._id.toString()));
    for (const id of orderedListIds) {
      if (!existingIds.has(id)) {
        return res.status(400).json({ message: 'orderedListIds içinde geçersiz liste var.' });
      }
    }

    await reorderDocs(KanbanList, orderedListIds);
    await logActivity({ req, entityType: 'list', entityId: null, action: 'reorder', workspaceId: board.workspaceId, boardId: board._id, message: 'Liste sırası güncellendi', meta: { orderedListIds } });
    emitBoardUpdated(board._id.toString(), { type: 'list:reorder' });
    const lists = await KanbanList.find({ boardId }).sort({ order: 1, createdAt: 1 });
    res.json(lists.map(shapeList));
  } catch (err) {
    console.error('PUT /kanban/boards/:boardId/lists/reorder error:', err);
    res.status(500).json({ message: 'Liste sırası güncellenemedi.' });
  }
});

router.post('/boards/:boardId/lists', async (req, res) => {
  try {
    const userId = req.user.id;
    const { boardId } = req.params;
    const { title } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Başlık zorunludur.' });

    const access = await ensureBoardAccess(boardId, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });
    const board = access.board;

    const order = await nextOrder(KanbanList, { boardId });
    const list = await KanbanList.create({
      ownerUserId: board.ownerUserId,
      workspaceId: board.workspaceId,
      boardId,
      title,
      order,
    });

    await logActivity({ req, entityType: 'list', entityId: list._id, action: 'create', workspaceId: list.workspaceId, boardId: list.boardId, message: `Liste oluşturuldu: ${list.title}` });
    emitBoardUpdated(list.boardId.toString(), { type: 'list:create' });

    res.status(201).json(shapeList(list));
  } catch (err) {
    console.error('POST /kanban/boards/:boardId/lists error:', err);
    res.status(500).json({ message: 'Liste oluşturulamadı.' });
  }
});

router.put('/lists/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const access = await ensureListAccess(id, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const body = req.body || {};
    delete body.ownerUserId;
    delete body.workspaceId;
    delete body.boardId;

    const list = await KanbanList.findByIdAndUpdate(id, body, { new: true });
    if (!list) return res.status(404).json({ message: 'Liste bulunamadı.' });
    res.json(shapeList(list));
  } catch (err) {
    console.error('PUT /kanban/lists/:id error:', err);
    res.status(500).json({ message: 'Liste güncellenemedi.' });
  }
});

router.delete('/lists/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const access = await ensureListAccess(id, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const list = await KanbanList.findByIdAndDelete(id);
    if (!list) return res.status(404).json({ message: 'Liste bulunamadı.' });

    await KanbanCard.deleteMany({ listId: id });

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /kanban/lists/:id error:', err);
    res.status(500).json({ message: 'Liste silinemedi.' });
  }
});

// Cards
router.get('/lists/:listId/cards', async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;

    const access = await ensureListAccess(listId, userId, 'read');
    if (!access.ok) return res.status(access.status).json({ message: access.message });
    const list = access.list;

    const cards = await KanbanCard.find({ listId, isArchived: { $ne: true } }).sort({ order: 1, createdAt: 1 });
    res.json(cards.map(shapeCard));
  } catch (err) {
    console.error('GET /kanban/lists/:listId/cards error:', err);
    res.status(500).json({ message: 'Kartlar getirilemedi.' });
  }
});

router.put('/lists/:listId/cards/reorder', async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const { orderedCardIds } = req.body || {};
    if (!Array.isArray(orderedCardIds)) {
      return res.status(400).json({ message: 'orderedCardIds zorunludur.' });
    }

    const access = await ensureListAccess(listId, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });
    const list = access.list;

    const existing = await KanbanCard.find({ listId }).select('_id').lean();
    const existingIds = new Set(existing.map((d) => d._id.toString()));
    for (const id of orderedCardIds) {
      if (!existingIds.has(id)) {
        return res.status(400).json({ message: 'orderedCardIds içinde geçersiz kart var.' });
      }
    }

    await reorderDocs(KanbanCard, orderedCardIds);
    await logActivity({ req, entityType: 'card', entityId: null, action: 'reorder', workspaceId: list.workspaceId, boardId: list.boardId, message: 'Kart sırası güncellendi', meta: { listId, orderedCardIds } });
    emitBoardUpdated(list.boardId.toString(), { type: 'card:reorder', listId });
    const cards = await KanbanCard.find({ listId }).sort({ order: 1, createdAt: 1 });
    res.json(cards.map(shapeCard));
  } catch (err) {
    console.error('PUT /kanban/lists/:listId/cards/reorder error:', err);
    res.status(500).json({ message: 'Kart sırası güncellenemedi.' });
  }
});

router.post('/lists/:listId/cards', async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const { title, description, assigneeUserId, fileUrl, fileType, fileName } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Başlık zorunludur.' });

    const access = await ensureListAccess(listId, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });
    const list = access.list;

    const order = await nextOrder(KanbanCard, { listId });
    const card = await KanbanCard.create({
      ownerUserId: list.ownerUserId,
      workspaceId: list.workspaceId,
      boardId: list.boardId,
      listId,
      title,
      description: description || '',
      fileUrl: fileUrl || '',
      fileType: fileType || '',
      fileName: fileName || '',
      order,
      assigneeUserId: assigneeUserId || null,
    });

    await logActivity({ req, entityType: 'card', entityId: card._id, action: 'create', workspaceId: card.workspaceId, boardId: card.boardId, message: `Kart oluşturuldu: ${card.title}` });
    emitBoardUpdated(card.boardId.toString(), { type: 'card:create', listId });

    res.status(201).json(shapeCard(card));
  } catch (err) {
    console.error('POST /kanban/lists/:listId/cards error:', err);
    res.status(500).json({ message: 'Kart oluşturulamadı.' });
  }
});

router.put('/cards/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const body = req.body || {};
    delete body.ownerUserId;

    const access0 = await ensureCardAccess(id, userId, 'write');
    if (!access0.ok) return res.status(access0.status).json({ message: access0.message });

    const cardBefore = await KanbanCard.findById(id).lean();

    // If listId provided, validate target list access
    if (body.listId) {
      const target = await ensureListAccess(body.listId, userId, 'write');
      if (!target.ok) return res.status(target.status).json({ message: target.message });
      body.listId = target.list._id;
      body.boardId = target.list.boardId;
      body.workspaceId = target.list.workspaceId;
    } else {
      delete body.workspaceId;
      delete body.boardId;
      delete body.listId;
    }

    const card = await KanbanCard.findByIdAndUpdate(id, body, { new: true });
    if (!card) return res.status(404).json({ message: 'Kart bulunamadı.' });

    const moved = !!body.boardId || !!body.listId;
    await logActivity({
      req,
      entityType: 'card',
      entityId: card._id,
      action: moved ? 'move' : 'update',
      workspaceId: card.workspaceId,
      boardId: card.boardId,
      message: moved ? 'Kart taşındı' : 'Kart güncellendi',
      meta: { before: cardBefore || null, after: { listId: card.listId.toString(), title: card.title } },
    });
    emitBoardUpdated(card.boardId.toString(), { type: moved ? 'card:move' : 'card:update', cardId: card._id.toString() });

    res.json(shapeCard(card));
  } catch (err) {
    console.error('PUT /kanban/cards/:id error:', err);
    res.status(500).json({ message: 'Kart güncellenemedi.' });
  }
});

router.delete('/cards/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const access = await ensureCardAccess(id, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const card = await KanbanCard.findByIdAndUpdate(id, { isArchived: true, archivedAt: new Date() }, { new: true });
    if (!card) return res.status(404).json({ message: 'Kart bulunamadı.' });

    await logActivity({ req, entityType: 'card', entityId: card._id, action: 'archive', workspaceId: card.workspaceId, boardId: card.boardId, message: `Kart arşivlendi: ${card.title}` });
    emitBoardUpdated(card.boardId.toString(), { type: 'card:archive', cardId: card._id.toString() });

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /kanban/cards/:id error:', err);
    res.status(500).json({ message: 'Kart silinemedi.' });
  }
});

// COMMENTS
router.get('/cards/:cardId/comments', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;
    
    const access = await ensureCardAccess(cardId, userId, 'read');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const comments = await KanbanComment.find({ cardId }).sort({ createdAt: 1 }).lean();
    const userIds = [...new Set(comments.map(c => c.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select('name surname email').lean();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const shaped = comments.map(c => ({
      id: c._id.toString(),
      cardId: c.cardId.toString(),
      userId: c.userId.toString(),
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: userMap.get(c.userId.toString()) || null,
    }));

    res.json(shaped);
  } catch (err) {
    console.error('GET /kanban/cards/:cardId/comments error:', err);
    res.status(500).json({ message: 'Yorumlar getirilemedi.' });
  }
});

router.post('/cards/:cardId/comments', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { content } = req.body || {};
    if (!content) return res.status(400).json({ message: 'İçerik zorunludur.' });

    const access = await ensureCardAccess(cardId, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const comment = await KanbanComment.create({ cardId, userId, content });
    const user = await User.findById(userId).select('name surname email').lean();

    await logActivity({ req, entityType: 'card', entityId: cardId, action: 'comment', workspaceId: access.card.workspaceId, boardId: access.card.boardId, message: `Yorum eklendi` });
    emitBoardUpdated(access.card.boardId.toString(), { type: 'comment:create', cardId });

    res.json({
      id: comment._id.toString(),
      cardId: comment.cardId.toString(),
      userId: comment.userId.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user,
    });
  } catch (err) {
    console.error('POST /kanban/cards/:cardId/comments error:', err);
    res.status(500).json({ message: 'Yorum eklenemedi.' });
  }
});

router.delete('/comments/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const comment = await KanbanComment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Yorum bulunamadı.' });

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Bu yorumu silme yetkiniz yok.' });
    }

    const access = await ensureCardAccess(comment.cardId.toString(), userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    await KanbanComment.findByIdAndDelete(id);
    emitBoardUpdated(access.card.boardId.toString(), { type: 'comment:delete', cardId: comment.cardId.toString(), commentId: id });

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /kanban/comments/:id error:', err);
    res.status(500).json({ message: 'Yorum silinemedi.' });
  }
});

// LABELS
router.get('/workspaces/:workspaceId/labels', async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;

    const access = await ensureWorkspaceAccess(workspaceId, userId, 'read');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const labels = await KanbanLabel.find({ workspaceId }).sort({ createdAt: 1 }).lean();
    res.json(labels.map(l => ({
      id: l._id.toString(),
      workspaceId: l.workspaceId.toString(),
      name: l.name,
      color: l.color,
      createdAt: l.createdAt,
    })));
  } catch (err) {
    console.error('GET /kanban/workspaces/:workspaceId/labels error:', err);
    res.status(500).json({ message: 'Etiketler getirilemedi.' });
  }
});

router.post('/workspaces/:workspaceId/labels', async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const { name, color } = req.body || {};
    if (!color) return res.status(400).json({ message: 'Renk zorunludur.' });

    const access = await ensureWorkspaceAccess(workspaceId, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const label = await KanbanLabel.create({ workspaceId, name: name || '', color });
    await logActivity({ req, entityType: 'workspace', entityId: workspaceId, action: 'label_create', workspaceId, message: `Etiket oluşturuldu${name ? ': ' + name : ''}` });

    res.json({
      id: label._id.toString(),
      workspaceId: label.workspaceId.toString(),
      name: label.name,
      color: label.color,
      createdAt: label.createdAt,
    });
  } catch (err) {
    console.error('POST /kanban/workspaces/:workspaceId/labels error:', err);
    res.status(500).json({ message: 'Etiket oluşturulamadı.' });
  }
});

router.delete('/labels/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const label = await KanbanLabel.findById(id);
    if (!label) return res.status(404).json({ message: 'Etiket bulunamadı.' });

    const access = await ensureWorkspaceAccess(label.workspaceId.toString(), userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    await KanbanLabel.findByIdAndDelete(id);
    await KanbanCard.updateMany({ labelIds: id }, { $pull: { labelIds: id } });

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /kanban/labels/:id error:', err);
    res.status(500).json({ message: 'Etiket silinemedi.' });
  }
});

// CHECKLISTS
router.get('/cards/:cardId/checklists', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    const access = await ensureCardAccess(cardId, userId, 'read');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const checklists = await KanbanChecklist.find({ cardId }).sort({ createdAt: 1 }).lean();
    res.json(checklists.map(cl => ({
      id: cl._id.toString(),
      cardId: cl.cardId.toString(),
      title: cl.title,
      items: cl.items.map(item => ({
        id: item._id.toString(),
        text: item.text,
        completed: item.completed,
        order: item.order,
      })),
      createdAt: cl.createdAt,
    })));
  } catch (err) {
    console.error('GET /kanban/cards/:cardId/checklists error:', err);
    res.status(500).json({ message: 'Checklist getirilemedi.' });
  }
});

router.post('/cards/:cardId/checklists', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { title } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Başlık zorunludur.' });

    const access = await ensureCardAccess(cardId, userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const checklist = await KanbanChecklist.create({ cardId, title, items: [] });
    await logActivity({ req, entityType: 'card', entityId: cardId, action: 'checklist_create', workspaceId: access.card.workspaceId, boardId: access.card.boardId, message: `Checklist oluşturuldu: ${title}` });
    emitBoardUpdated(access.card.boardId.toString(), { type: 'checklist:create', cardId });

    res.json({
      id: checklist._id.toString(),
      cardId: checklist.cardId.toString(),
      title: checklist.title,
      items: [],
      createdAt: checklist.createdAt,
    });
  } catch (err) {
    console.error('POST /kanban/cards/:cardId/checklists error:', err);
    res.status(500).json({ message: 'Checklist oluşturulamadı.' });
  }
});

router.put('/checklists/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, items } = req.body || {};

    const checklist = await KanbanChecklist.findById(id);
    if (!checklist) return res.status(404).json({ message: 'Checklist bulunamadı.' });

    const access = await ensureCardAccess(checklist.cardId.toString(), userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    if (title !== undefined) checklist.title = title;
    if (items !== undefined) checklist.items = items;

    await checklist.save();
    emitBoardUpdated(access.card.boardId.toString(), { type: 'checklist:update', cardId: checklist.cardId.toString() });

    res.json({
      id: checklist._id.toString(),
      cardId: checklist.cardId.toString(),
      title: checklist.title,
      items: checklist.items.map(item => ({
        id: item._id.toString(),
        text: item.text,
        completed: item.completed,
        order: item.order,
      })),
      createdAt: checklist.createdAt,
    });
  } catch (err) {
    console.error('PUT /kanban/checklists/:id error:', err);
    res.status(500).json({ message: 'Checklist güncellenemedi.' });
  }
});

router.delete('/checklists/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const checklist = await KanbanChecklist.findById(id);
    if (!checklist) return res.status(404).json({ message: 'Checklist bulunamadı.' });

    const access = await ensureCardAccess(checklist.cardId.toString(), userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    await KanbanChecklist.findByIdAndDelete(id);
    emitBoardUpdated(access.card.boardId.toString(), { type: 'checklist:delete', cardId: checklist.cardId.toString() });

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /kanban/checklists/:id error:', err);
    res.status(500).json({ message: 'Checklist silinemedi.' });
  }
});

// ARCHIVED CARDS
router.get('/workspaces/:workspaceId/archived-cards', async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;

    const access = await ensureWorkspaceAccess(workspaceId, userId, 'read');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const archivedCards = await KanbanCard.find({ workspaceId, isArchived: true }).sort({ archivedAt: -1, updatedAt: -1 }).lean();
    
    const listIds = [...new Set(archivedCards.map(c => c.listId.toString()))];
    const lists = await KanbanList.find({ _id: { $in: listIds } }).select('title').lean();
    const listMap = new Map(lists.map(l => [l._id.toString(), l]));

    const shaped = archivedCards.map(c => ({
      ...shapeCard(c),
      listTitle: listMap.get(c.listId.toString())?.title || 'Bilinmeyen Liste',
    }));

    res.json(shaped);
  } catch (err) {
    console.error('GET /kanban/workspaces/:workspaceId/archived-cards error:', err);
    res.status(500).json({ message: 'Arşivlenmiş kartlar getirilemedi.' });
  }
});

router.put('/cards/:id/restore', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const card = await KanbanCard.findById(id);
    if (!card) return res.status(404).json({ message: 'Kart bulunamadı.' });
    if (!card.isArchived) return res.status(400).json({ message: 'Bu kart zaten arşivde değil.' });

    const access = await ensureBoardAccess(card.boardId.toString(), userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    card.isArchived = false;
    card.archivedAt = null;
    await card.save();

    await logActivity({ req, entityType: 'card', entityId: card._id, action: 'restore', workspaceId: card.workspaceId, boardId: card.boardId, message: `Kart geri yüklendi: ${card.title}` });
    emitBoardUpdated(card.boardId.toString(), { type: 'card:restore', cardId: card._id.toString() });

    res.json(shapeCard(card));
  } catch (err) {
    console.error('PUT /kanban/cards/:id/restore error:', err);
    res.status(500).json({ message: 'Kart geri yüklenemedi.' });
  }
});

// PERMANENT DELETE (only for archived cards)
router.delete('/cards/:id/permanent', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const card = await KanbanCard.findById(id);
    if (!card) return res.status(404).json({ message: 'Kart bulunamadı.' });
    if (!card.isArchived) return res.status(400).json({ message: 'Sadece arşivlenmiş kartlar kalıcı olarak silinebilir.' });

    const access = await ensureBoardAccess(card.boardId.toString(), userId, 'write');
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    await KanbanCard.findByIdAndDelete(id);

    await logActivity({ req, entityType: 'card', entityId: card._id, action: 'permanent_delete', workspaceId: card.workspaceId, boardId: card.boardId, message: `Kart kalıcı olarak silindi: ${card.title}` });

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /kanban/cards/:id/permanent error:', err);
    res.status(500).json({ message: 'Kart kalıcı olarak silinemedi.' });
  }
});

  return router;
};

export default createKanbanRoutes;
