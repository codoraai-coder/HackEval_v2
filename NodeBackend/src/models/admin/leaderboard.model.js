import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  rank: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    trim: true
  },
  innovationCreativity: {
    type: Number,
    default: 0
  },
  technicalFeasibility: {
    type: Number,
    default: 0
  },
  potentialImpact: {
    type: Number,
    default: 0
  },
  fileName: {
    type: String,
    trim: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for ranking queries
leaderboardSchema.index({ rank: 1 });
leaderboardSchema.index({ score: -1 });

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
