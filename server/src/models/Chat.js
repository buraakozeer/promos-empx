import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true }, // user id string
    text: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileType: { type: String, default: '' },
    fileName: { type: String, default: '' },
    time: { type: String, required: true }, // HH:MM
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    participants: [{ type: String, required: true }], // user id string'leri
    messages: [messageSchema],
    unreadBy: [{ type: String }], // user id string'leri
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
