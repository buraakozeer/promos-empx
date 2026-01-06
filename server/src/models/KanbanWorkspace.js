import mongoose from 'mongoose';

const kanbanMemberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], required: true },
  },
  { _id: false }
);

const kanbanWorkspaceSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: { type: [kanbanMemberSchema], default: [] },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

kanbanWorkspaceSchema.index({ 'members.userId': 1 });

const KanbanWorkspace = mongoose.model('KanbanWorkspace', kanbanWorkspaceSchema);

export default KanbanWorkspace;
