import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Evaluation } from "../../models/judge/teamEvaluation.model.js";
import { Team } from "../../models/team/user.model.js";

// Submit evaluation
const submitEvaluation = asyncHandler(async (req, res) => {
  const {
    team_id,
    team_name,
    problem_statement,
    category,
    round_id,
    problem_solution_fit,
    functionality_features,
    technical_feasibility,
    innovation_creativity,
    user_experience,
    impact_value,
    presentation_demo_quality,
    team_collaboration,
    personalized_feedback
  } = req.body;

  // Validate required fields
  if (!team_id || !team_name) {
    throw new ApiError(400, "Team ID and name are required");
  }

  // Calculate scores
  const total_score = 
    problem_solution_fit + functionality_features + technical_feasibility +
    innovation_creativity + user_experience + impact_value +
    presentation_demo_quality + team_collaboration;

  const average_score = total_score / 8;

  try {
    // Create or update evaluation
    const evaluation = await Evaluation.findOneAndUpdate(
      { team_id, judge_id: req.judge._id },
      {
        team_id,
        team_name,
        problem_statement,
        category,
        round_id,
        problem_solution_fit,
        functionality_features,
        technical_feasibility,
        innovation_creativity,
        user_experience,
        impact_value,
        presentation_demo_quality,
        team_collaboration,
        personalized_feedback,
        total_score,
        average_score,
        judge_id: req.judge._id,
        judge_name: req.judge.name
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Update team evaluation status
    await Team.findByIdAndUpdate(team_id, {
      evaluationStatus: 'completed',
      evaluationScore: average_score
    });

    res.status(200).json(
      new ApiResponse(200, {
        evaluation,
        total_score,
        average_score: average_score.toFixed(2)
      }, "Evaluation submitted successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to submit evaluation: " + error.message);
  }
});

// Save evaluation draft
const saveDraft = asyncHandler(async (req, res) => {
  const {
    team_id,
    team_name,
    problem_statement,
    category,
    round_id,
    problem_solution_fit,
    functionality_features,
    technical_feasibility,
    innovation_creativity,
    user_experience,
    impact_value,
    presentation_demo_quality,
    team_collaboration,
    personalized_feedback
  } = req.body;

  try {
    const evaluation = await Evaluation.findOneAndUpdate(
      { team_id, judge_id: req.judge._id },
      {
        team_id,
        team_name,
        problem_statement,
        category,
        round_id,
        problem_solution_fit,
        functionality_features,
        technical_feasibility,
        innovation_creativity,
        user_experience,
        impact_value,
        presentation_demo_quality,
        team_collaboration,
        personalized_feedback,
        status: 'draft',
        judge_id: req.judge._id,
        judge_name: req.judge.name
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(
      new ApiResponse(200, evaluation, "Draft saved successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to save draft: " + error.message);
  }
});

// Get evaluation for a team
const getEvaluation = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const evaluation = await Evaluation.findOne({
    team_id: teamId,
    judge_id: req.judge._id
  });

  if (!evaluation) {
    throw new ApiError(404, "Evaluation not found");
  }

  res.status(200).json(
    new ApiResponse(200, evaluation, "Evaluation retrieved successfully")
  );
});

// Get all evaluations by judge
const getJudgeEvaluations = asyncHandler(async (req, res) => {
  const evaluations = await Evaluation.find({ judge_id: req.judge._id });

  res.status(200).json(
    new ApiResponse(200, evaluations, "Evaluations retrieved successfully")
  );
});

export {
  submitEvaluation,
  saveDraft,
  getEvaluation,
  getJudgeEvaluations
};