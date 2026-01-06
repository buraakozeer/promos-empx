import mongoose from 'mongoose';

const requestCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const RequestCategory = mongoose.model('RequestCategory', requestCategorySchema);

export default RequestCategory;
