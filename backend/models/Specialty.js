import mongoose from 'mongoose';

const specialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '', // e.g., fontawesome icon class or path
    },
  },
  {
    timestamps: true,
  }
);

const Specialty = mongoose.model('Specialty', specialtySchema);
export default Specialty;
