import mongoose from 'mongoose';

const roundStateSchema = new mongoose.Schema({
  round: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  activeAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const RoundState = mongoose.model('RoundState', roundStateSchema);
