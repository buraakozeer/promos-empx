import mongoose from 'mongoose';

const kanbanCommentSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanCard', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const KanbanComment = mongoose.model('KanbanComment', kanbanCommentSchema);

export default KanbanComment;
