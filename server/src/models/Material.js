import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, required: true }, // "Metre" | "Adet" vb.
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    currency: { type: String, required: true }, // "TL" | "USD" | "EUR"
    price: { type: Number, required: true },
    area: { type: Number, default: 0 },
    calculatedPrices: { type: mongoose.Schema.Types.Mixed, default: null },
    costPerCm2: { type: mongoose.Schema.Types.Mixed, default: null },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Material = mongoose.model('Material', materialSchema);

export default Material;
