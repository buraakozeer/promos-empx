import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // hedef kullanıcı id'si (JWT'deki user.id ile aynı format)
    type: { type: String, enum: ['chat', 'event', 'system'], default: 'system' },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' }, // frontend'te yönlendirme için (örn. "/messages" veya "/agenda")
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
