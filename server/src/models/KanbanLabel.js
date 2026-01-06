import mongoose from 'mongoose';

const kanbanLabelSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanWorkspace', required: true, index: true },
    name: { type: String, default: '' },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

const KanbanLabel = mongoose.model('KanbanLabel', kanbanLabelSchema);

export default KanbanLabel;
