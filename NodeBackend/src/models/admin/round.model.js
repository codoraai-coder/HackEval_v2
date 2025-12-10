import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  uploadDeadline: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value >= this.startTime && value <= this.endTime;
      },
      message: 'Upload deadline must be between start and end time'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'live', 'completed'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save hook to update status based on current time
roundSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.startTime <= now && this.endTime > now) {
    this.status = 'live';
  } else if (this.endTime <= now) {
    this.status = 'completed';
  }
  
  next();
});

export const Round = mongoose.model('Round', roundSchema);