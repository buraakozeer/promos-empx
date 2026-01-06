import mongoose from 'mongoose';

const kanbanCardSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanWorkspace', required: true, index: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanBoard', required: true, index: true },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanList', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileType: { type: String, default: '' },
    fileName: { type: String, default: '' },
    order: { type: Number, default: 0 },
    assigneeUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    labelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KanbanLabel' }],
    dueDate: { type: Date, default: null },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const KanbanCard = mongoose.model('KanbanCard', kanbanCardSchema);

export default KanbanCard;
