import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    tcNo: { type: String },
    birthDate: { type: String },
    startDate: { type: String },
    manager: { type: String },
    salary: { type: Number },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;
