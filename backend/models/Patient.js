import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Other',
    },
    bloodGroup: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
