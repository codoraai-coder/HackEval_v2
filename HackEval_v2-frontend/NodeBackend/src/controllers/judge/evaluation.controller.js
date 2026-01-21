import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Judge } from "../../models/judge/user.model.js";
import { Team } from "../../models/team/user.model.js";
import { Evaluation } from "../../models/judge/teamEvaluation.model.js";

// Get all judges
const getJudges = asyncHandler(async (req, res) => {
  const judges = await Judge.find({ isActive: true }).select("-password -refreshToken");
  
  res.status(200).json(
    new ApiResponse(200, judges, "Judges retrieved successfully")
  );
});

// Get teams for judge assignment
const getTeamsForAssignment = asyncHandler(async (req, res) => {
  const teams = await Team.find({ isActive: true })
    .populate('assignedJudge', 'name expertise')
    .select("-password");
  
  res.status(200).json(
    new ApiResponse(200, teams, "Teams retrieved successfully")
  );
});

// Assign judge to team
const assignJudgeToTeam = asyncHandler(async (req, res) => {
  const { teamId, judgeId } = req.body;

  if (!teamId || !judgeId) {
    throw new ApiError(400, "Team ID and Judge ID are required");
  }

  const team = await Team.findById(teamId);
  const judge = await Judge.findById(judgeId);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  if (!judge) {
    throw new ApiError(404, "Judge not found");
  }

  team.assignedJudge = judgeId;
  team.evaluationStatus = 'assigned';
  await team.save();

  const updatedTeam = await Team.findById(teamId)
    .populate('assignedJudge', 'name expertise')
    .select("-password");

  res.status(200).json(
    new ApiResponse(200, updatedTeam, "Judge assigned successfully")
  );
});

// Unassign judge from team
const unassignJudgeFromTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId);

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  team.assignedJudge = null;
  team.evaluationStatus = 'unassigned';
  team.evaluationScore = null;
  await team.save();

  const updatedTeam = await Team.findById(teamId)
    .populate('assignedJudge', 'name expertise')
    .select("-password");

  res.status(200).json(
    new ApiResponse(200, updatedTeam, "Judge unassigned successfully")
  );
});

// Get judge statistics
const getJudgeStatistics = asyncHandler(async (req, res) => {
  const judges = await Judge.find({ isActive: true });
  
  const statistics = await Promise.all(
    judges.map(async (judge) => {
      const assignedTeams = await Team.countDocuments({ assignedJudge: judge._id });
      const completedEvaluations = await Team.countDocuments({ 
        assignedJudge: judge._id, 
        evaluationStatus: 'completed' 
      });
      
      return {
        judgeId: judge._id,
        judgeName: judge.name,
        assignedTeams,
        completedEvaluations
      };
    })
  );
  
  res.status(200).json(
    new ApiResponse(200, statistics, "Judge statistics retrieved successfully")
  );
});


const getAllEvaluations = asyncHandler(async (req, res) => {
  try {
    const evaluations = await Evaluation.find({})
      .populate('team_id', 'teamName category')
      .populate('judge_id', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(
      new ApiResponse(200, evaluations, "All evaluations retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching evaluations: " + error.message);
  }
});

// Get all teams with their evaluation status
const getAllTeamsWithEvaluations = asyncHandler(async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate('assignedJudge', 'name expertise')
      .select("-password");
    
    res.status(200).json(
      new ApiResponse(200, teams, "Teams with evaluation status retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching teams: " + error.message);
  }
});

export {
  getJudges,
  getTeamsForAssignment,
  assignJudgeToTeam,
  unassignJudgeFromTeam,
  getJudgeStatistics,
  getAllEvaluations,
  getAllTeamsWithEvaluations
};