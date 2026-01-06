import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    time: { type: String, required: true }, // 'HH:MM'
    endTime: { type: String, required: true },
    type: { type: String, default: 'meeting' },
    description: { type: String, default: '' },
    participants: [{ type: String }], // user id string'leri
    unreadBy: [{ type: String }],     // user id string'leri
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
