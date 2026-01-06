import mongoose from 'mongoose';

const kanbanListSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanWorkspace', required: true, index: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanBoard', required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const KanbanList = mongoose.model('KanbanList', kanbanListSchema);

export default KanbanList;
