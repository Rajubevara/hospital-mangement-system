import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  slots: {
    type: [String], // e.g., ["09:00", "09:30", "10:00"]
    required: true,
  },
});

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
      required: true,
    },
    experience: {
      type: Number,
      default: 0, // in years
    },
    qualification: {
      type: String,
      default: '',
    },
    biography: {
      type: String,
      default: '',
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 0,
    },
    availability: {
      type: [availabilitySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
