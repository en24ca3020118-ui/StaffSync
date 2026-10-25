import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema(
  {
    rating: { type: Number, min: 1, max: 5, required: true },
    note: { type: String, trim: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: { type: String, unique: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    joiningDate: { type: Date, default: Date.now },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    performance: [performanceSchema],
  },
  { timestamps: true }
);

employeeSchema.index({ department: 1 });
employeeSchema.index({ manager: 1 });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
