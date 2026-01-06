import mongoose from 'mongoose';

const productMaterialSchema = new mongoose.Schema(
  {
    id: { type: String, required: false }, // eski front-end veya ObjectId-string ile uyum için
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: false },
    name: { type: String },
    unit: { type: String },
    width: { type: Number },
    height: { type: Number },
    currency: { type: String },
    price: { type: Number },
    area: { type: Number },
    calculatedPrices: { type: mongoose.Schema.Types.Mixed },
    costPerCm2: { type: mongoose.Schema.Types.Mixed },
    usedQuantity: { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    materials: [productMaterialSchema],
    salePrice: { type: Number, default: 0 }, // TL cinsinden satış fiyatı
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
