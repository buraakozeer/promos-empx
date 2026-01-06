import mongoose from 'mongoose';

const kanbanActivitySchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanWorkspace', default: null, index: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanBoard', default: null, index: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    action: { type: String, required: true },
    message: { type: String, default: '' },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

const KanbanActivity = mongoose.model('KanbanActivity', kanbanActivitySchema);

export default KanbanActivity;
