import mongoose from 'mongoose';

const kanbanMemberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], required: true },
  },
  { _id: false }
);

const kanbanBoardSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanWorkspace', required: true, index: true },
    members: { type: [kanbanMemberSchema], default: [] },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

kanbanBoardSchema.index({ workspaceId: 1, 'members.userId': 1 });

const KanbanBoard = mongoose.model('KanbanBoard', kanbanBoardSchema);

export default KanbanBoard;
