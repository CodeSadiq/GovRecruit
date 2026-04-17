import mongoose from 'mongoose';

const QueuedQualSchema = new mongoose.Schema({
  qualification: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'synced'],
    default: 'pending',
  }
});

// Avoid re-compiling model if it already exists
export default mongoose.models.QueuedQual || mongoose.model('QueuedQual', QueuedQualSchema);
