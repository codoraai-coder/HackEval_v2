import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  team_name: {
    type: String,
    required: true
  },
  problem_statement: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  round_id: {
    type: Number,
    required: true,
    default: 1
  },
  problem_solution_fit: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  functionality_features: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  technical_feasibility: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  innovation_creativity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  user_experience: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  impact_value: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  presentation_demo_quality: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  team_collaboration: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  personalized_feedback: {
    type: String,
    required: true
  },
  total_score: {
    type: Number,
    required: true
  },
  average_score: {
    type: Number,
    required: true
  },
  judge_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Judge',
    required: true
  },
  judge_name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Compound index to ensure one evaluation per judge per team
evaluationSchema.index({ team_id: 1, judge_id: 1 }, { unique: true });

export const Evaluation = mongoose.model('Evaluation', evaluationSchema);