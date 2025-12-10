import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const judgeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
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
  expertise: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    default: ''
  },
  assignedRounds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
    refreshToken: {
      type: String,
    },
}, {
  timestamps: true
});

// Hash password before saving
judgeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
judgeSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
judgeSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

// Generate refresh token
judgeSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

export const Judge = mongoose.model('Judge', judgeSchema);