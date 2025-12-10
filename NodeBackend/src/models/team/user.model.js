// import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';

// const teamMemberSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true
//   },
//   phone: {
//     type: String,
//     trim: true
//   },
//   isLeader: {
//     type: Boolean,
//     default: false
//   }
// });

// const teamSchema = new mongoose.Schema({
//   teamName: {
//     type: String,
//     required: true,
//     trim: true,
//     unique: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   members: [teamMemberSchema],
//   projectTitle: {
//     type: String,
//     trim: true
//   },
//   projectDescription: {
//     type: String,
//     trim: true
//   },
//   technologyStack: [String],
//   category: {
//     type: String,
//     trim: true
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// // Hash password before saving
// teamSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Compare password method
// teamSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Remove password when converting to JSON
// teamSchema.methods.toJSON = function() {
//   const team = this.toObject();
//   delete team.password;
//   return team;
// };

// export const Team = mongoose.model('Team', teamSchema);








import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  isLeader: {
    type: Boolean,
    default: false
  }
});

const pptAnalysisSchema = new mongoose.Schema({
  // File info
  pptFile: {
    originalName: String,
    storedName: String,
    filePath: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Analysis results from Flask API
  analysisResults: {
    overall_score: Number,
    scores: {
      type: Map,
      of: Number
    },
    feedback: {
      strengths: [String],
      improvements: [String],
      suggestions: [String]
    },
    summary: String,
    format_evaluation: {
      score: Number,
      notes: [String]
    },
    workflow_analysis: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    evaluation_parameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  
  // Analysis metadata
  analysisDate: {
    type: Date,
    default: Date.now
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  analysisError: String
});

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
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
  members: [teamMemberSchema],
  projectTitle: {
    type: String,
    trim: true
  },
  projectDescription: {
    type: String,
    trim: true
  },
  technologyStack: [String],
  category: {
    type: String,
    trim: true
  },
  
  // PPT Submission and Analysis
  pptSubmission: pptAnalysisSchema,
  
  // Problem Statement
  problemStatement: {
    title: String,
    description: String,
    category: String,
    ps_id: String
  },
  
  // Judge assignment
  assignedJudge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Judge',
    default: null
  },
  evaluationScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  evaluationStatus: {
    type: String,
    enum: ['unassigned', 'assigned', 'in-progress', 'completed'],
    default: 'unassigned'
  },
  evaluationComments: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
teamSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
teamSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password when converting to JSON
teamSchema.methods.toJSON = function() {
  const team = this.toObject();
  delete team.password;
  return team;
};

export const Team = mongoose.model('Team', teamSchema);