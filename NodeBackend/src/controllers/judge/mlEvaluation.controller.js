import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { MLEvaluation } from "../../models/mlEvaluation.model.js";
import { Team } from "../../models/team/user.model.js";

// Submit ML evaluation
const submitMLEvaluation = asyncHandler(async (req, res) => {
  const {
    team_id,
    team_name,
    file_path,
    evaluation_error,

    problem_identification,
    user_centric_approach,
    innovation_quotient,
    technical_readiness,
    market_potential,
    social_impact,
    research_depth,
    presentation_quality,
    presentation_format,

    total_raw,
    total_weighted,

    summary,
    workflow_overall,
    feedback_positive,
    feedback_criticism,
    feedback_technical,
    feedback_suggestions
  } = req.body;

  if (!team_id || !team_name) {
    throw new ApiError(400, "Team ID and name are required");
  }

  const mlEvaluation = await MLEvaluation.findOneAndUpdate(
    { team_id },
    {
      team_id,
      team_name,
      file_path,
      evaluation_error,

      problem_identification,
      user_centric_approach,
      innovation_quotient,
      technical_readiness,
      market_potential,
      social_impact,
      research_depth,
      presentation_quality,
      presentation_format,

      total_raw,
      total_weighted,

      summary,
      workflow_overall,
      feedback_positive,
      feedback_criticism,
      feedback_technical,
      feedback_suggestions
    },
    { upsert: true, new: true, runValidators: true }
  );

  // Optional: store ML score reference on Team
  await Team.findByIdAndUpdate(team_id, {
    mlEvaluationScore: total_weighted,
    mlEvaluationStatus: "completed"
  });

  res.status(200).json(
    new ApiResponse(200, mlEvaluation, "ML evaluation stored successfully")
  );
});

// Get ML evaluation by team
const getMLEvaluation = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const evaluation = await MLEvaluation.findOne({ team_id: teamId });

  if (!evaluation) {
    throw new ApiError(404, "ML Evaluation not found");
  }

  res.status(200).json(
    new ApiResponse(200, evaluation, "ML Evaluation retrieved successfully")
  );
});

// Get all ML evaluations
const getAllMLEvaluations = asyncHandler(async (req, res) => {
  const evaluations = await MLEvaluation.find();

  res.status(200).json(
    new ApiResponse(200, evaluations, "All ML evaluations retrieved")
  );
});

export {
  submitMLEvaluation,
  getMLEvaluation,
  getAllMLEvaluations
};
