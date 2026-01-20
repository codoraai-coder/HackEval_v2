import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Team } from "../../models/team/user.model.js";
import { Evaluation } from "../../models/judge/teamEvaluation.model.js";

export const getPPTLeaderboard = asyncHandler(async (req, res) => {
  const teams = await Team.find({ isActive: true }).select("teamName pptSubmission");

  // Get all judge evaluations (include all statuses)
  const evaluations = await Evaluation.find();

  // Group evaluations by team
  const evalMap = {};
  evaluations.forEach(ev => {
    if (!evalMap[ev.team_name]) {
      evalMap[ev.team_name] = [];
    }
    evalMap[ev.team_name].push(ev);
  });

  const evaluated = [];
  const pending = [];

  teams.forEach(team => {
    // ✅ 1. AI PPT evaluation (highest priority)
    const ppt = team.pptSubmission;
    if (ppt && ppt.analysisStatus === "completed" && ppt.analysisResults) {
      const scores = ppt.analysisResults.scores || {};

      evaluated.push({
        team_name: team.teamName,
        innovation_uniqueness: Number(scores.innovation || 0),
        technical_feasibility: Number(scores.technical || 0),
        potential_impact: Number(scores.impact || 0),
        total_score: Number(ppt.analysisResults.overall_score || 0),
        status: "ai_evaluated"
      });
      return;
    }

    // ✅ 2. Judge evaluation fallback
    const teamEvals = evalMap[team.teamName];
    if (teamEvals && teamEvals.length > 0) {
      const avg = (field) =>
        teamEvals.reduce((s, e) => s + (e[field] || 0), 0) / teamEvals.length;

      evaluated.push({
        team_name: team.teamName,
        innovation_uniqueness: Math.round(avg("innovation_creativity")),
        technical_feasibility: Math.round(avg("technical_feasibility")),
        potential_impact: Math.round(avg("impact_value")),
        total_score: Math.round(avg("total_score")),
        status: "judge_evaluated"
      });
      return;
    }

    // ❌ 3. Not evaluated
    pending.push({
      team_name: team.teamName,
      innovation_uniqueness: null,
      technical_feasibility: null,
      potential_impact: null,
      total_score: null,
      rank: null,
      status: "pending"
    });
  });

  // Sort evaluated teams
  evaluated.sort((a, b) => b.total_score - a.total_score);

  // Assign ranks
  evaluated.forEach((t, i) => {
    t.rank = i + 1;
  });

  const leaderboard = [...evaluated, ...pending];

  return res.status(200).json(
    new ApiResponse(200, leaderboard, "Leaderboard generated successfully")
  );
});
