import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema(
  {
    staffId: { type: String, required: true }, // Staff modelindeki id (string)
    year: { type: Number, required: true },
    month: { type: Number, required: true }, // 1-12
    attendance: { type: mongoose.Schema.Types.Mixed }, // { "1": "X", "2": "/", ... }
  },
  { timestamps: true }
);

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);

export default TimeEntry;
