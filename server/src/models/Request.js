import mongoose from 'mongoose';

const requestItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'RequestProduct', default: null },
  productName: { type: String, required: true },
  categoryName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'Adet' },
  note: { type: String, default: '' },
  isCustom: { type: Boolean, default: false },
});

const requestSchema = new mongoose.Schema(
  {
    personnelId: { type: String, required: true, index: true },
    personnelName: { type: String, required: true },
    personnelSurname: { type: String, default: '' },
    personnelNote: { type: String, default: '' },
    items: [requestItemSchema],
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'partial', 'completed'], 
      default: 'pending',
      index: true
    },
    adminNote: { type: String, default: '' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);

export default Request;
