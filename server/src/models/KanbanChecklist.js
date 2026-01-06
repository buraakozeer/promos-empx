import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const kanbanChecklistSchema = new mongoose.Schema(
  {
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'KanbanCard', required: true, index: true },
    title: { type: String, required: true },
    items: [checklistItemSchema],
  },
  { timestamps: true }
);

const KanbanChecklist = mongoose.model('KanbanChecklist', kanbanChecklistSchema);

export default KanbanChecklist;
