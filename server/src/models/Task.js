import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subTasks: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      detail: { type: String, default: '' }
    }],
    extensionRequest: {
      requestedDate: { type: Date },
      reason: { type: String },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    attachment: {
      name: { type: String },
      url: { type: String },
      type: { type: String }
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isRecurring: { type: Boolean, default: false },
    recurrenceType: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    recurringParentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
