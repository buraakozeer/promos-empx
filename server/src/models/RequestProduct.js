import mongoose from 'mongoose';

const requestProductSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'RequestCategory', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    unit: { type: String, default: 'Adet' }, // Adet, Paket, Kutu, etc.
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const RequestProduct = mongoose.model('RequestProduct', requestProductSchema);

export default RequestProduct;
