import mongoose from "mongoose";

const mlEvaluationSchema = new mongoose.Schema(
  {
    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true
    },

    team_name: {
      type: String,
      required: true
    },

    file_path: String,
    evaluation_error: String,

    problem_identification: Number,
    user_centric_approach: Number,
    innovation_quotient: Number,
    technical_readiness: Number,
    market_potential: Number,
    social_impact: Number,
    research_depth: Number,
    presentation_quality: Number,
    presentation_format: Number,

    total_raw: Number,
    total_weighted: Number,

    summary: String,
    workflow_overall: String,

    feedback_positive: String,
    feedback_criticism: String,
    feedback_technical: String,
    feedback_suggestions: String,

    source: {
      type: String,
      default: "ml_model"
    }
  },
  { timestamps: true }
);

export const MLEvaluation = mongoose.model(
  "MLEvaluation",
  mlEvaluationSchema
);
