import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  expertise: {
    type: [String],
    default: []
  },
  availability: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'busy', 'inactive'],
    default: 'active'
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  assignedTeams: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  sessions: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
mentorSchema.index({ name: 'text', email: 'text', expertise: 'text' });

export const Mentor = mongoose.model('Mentor', mentorSchema);