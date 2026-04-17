import mongoose from 'mongoose';

const RegistrySchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
  branches: [
    {
      value: String,
      label: String,
    }
  ]
}, { timestamps: true });

export default mongoose.models.Registry || mongoose.model('Registry', RegistrySchema);
