import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true, // e.g., "1-0-1" or "Once daily"
  },
  duration: {
    type: String,
    required: true, // e.g., "5 days"
  },
  instructions: {
    type: String,
    default: '', // e.g., "After food"
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medicines: {
      type: [medicineSchema],
      default: [],
    },
    labTests: {
      type: [String],
      default: [],
    },
    advice: {
      type: String,
      default: '',
    },
    pdfPath: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
