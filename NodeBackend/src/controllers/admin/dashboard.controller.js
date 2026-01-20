import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { ApiError } from "../../utils/ApiError.js";
import { Team } from "../../models/team/user.model.js";
import { Judge } from "../../models/judge/user.model.js";
import { Evaluation } from "../../models/judge/teamEvaluation.model.js";
import { RoundState } from "../../models/admin/roundState.model.js";

/**
 * Get dashboard statistics
 * @route GET /admin/dashboard/stats
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    try {
        // Get total teams count
        const totalTeams = await Team.countDocuments();

        // Get total judges count
        const totalJudges = await Judge.countDocuments();

        // Get active round - RoundState stores active rounds with isActive flag
        const activeRoundDoc = await RoundState.findOne({ isActive: true });
        const activeRound = activeRoundDoc?.round || null;

        // Calculate average score from evaluations
        const evaluations = await Evaluation.find();
        let averageScore = 0;
        if (evaluations.length > 0) {
            const totalScore = evaluations.reduce((sum, evaluation) => {
                // Sum all the score fields from the evaluation model
                const score =
                    (evaluation.problem_solution_fit || 0) +
                    (evaluation.functionality_features || 0) +
                    (evaluation.technical_feasibility || 0) +
                    (evaluation.innovation_creativity || 0) +
                    (evaluation.user_experience || 0) +
                    (evaluation.impact_value || 0) +
                    (evaluation.presentation_demo_quality || 0) +
                    (evaluation.team_collaboration || 0);
                return sum + score;
            }, 0);
            // Divide by number of evaluations and number of criteria (8)
            averageScore = (totalScore / evaluations.length / 8).toFixed(1);
        }

        // Get recent team registrations for "change" indicator
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentTeams = await Team.countDocuments({
            createdAt: { $gte: oneDayAgo },
        });

        const recentJudges = await Judge.countDocuments({
            createdAt: { $gte: oneDayAgo },
        });

        const stats = {
            totalTeams: {
                value: totalTeams.toString(),
                change: recentTeams > 0 ? `+${recentTeams}` : "0",
                changeType: recentTeams > 0 ? "positive" : "neutral",
            },
            activeRounds: {
                value: activeRound ? "1" : "0",
                change: activeRound ? `Round ${activeRound} live` : "No active round",
                changeType: "info",
            },
            judgesAssigned: {
                value: totalJudges.toString(),
                change: recentJudges > 0 ? `+${recentJudges}` : "0",
                changeType: recentJudges > 0 ? "positive" : "neutral",
            },
            averageScore: {
                value: averageScore.toString() || "0",
                change: evaluations.length > 0 ? `${evaluations.length} evaluations` : "No data",
                changeType: "info",
            },
        };

        return res
            .status(200)
            .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Error fetching dashboard stats", [error.message]);
    }
});

/**
 * Get recent activities
 * @route GET /admin/dashboard/activities
 */
export const getRecentActivities = asyncHandler(async (req, res) => {
    try {
        const activities = [];

        // Get recent team registrations
        const recentTeams = await Team.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select("teamName createdAt");

        recentTeams.forEach((team) => {
            activities.push({
                type: "team",
                message: `New team registered: ${team.teamName}`,
                time: getRelativeTime(team.createdAt),
                status: "success",
            });
        });

        // Get recent evaluations
        const recentEvaluations = await Evaluation.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate("team_id", "teamName")
            .populate("judge_id", "name");

        recentEvaluations.forEach((evaluation) => {
            const totalScore = evaluation.total_score || 0;
            activities.push({
                type: "evaluation",
                message: `${evaluation.judge_name || "Judge"} evaluated ${evaluation.team_name || "Team"} - Score: ${totalScore}/80`,
                time: getRelativeTime(evaluation.createdAt),
                status: "info",
            });
        });

        // Sort all activities by time
        activities.sort((a, b) => {
            // This is a simple sort, you might want to store actual timestamps
            return 0;
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    activities.slice(0, 5),
                    "Recent activities fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Error fetching recent activities", [
            error.message,
        ]);
    }
});

/**
 * Get final submissions with team data and evaluations
 * @route GET /admin/dashboard/final-submissions
 */
export const getFinalSubmissions = asyncHandler(async (req, res) => {
    try {
        // Get all teams with their evaluations
        const teams = await Team.find()
            .select("teamName email projectTitle projectDescription category technologyStack members createdAt pptSubmission")
            .lean();

        const submissions = [];

        for (const team of teams) {
            // Get evaluations for this team
            const evaluations = await Evaluation.find({ team_id: team._id })
                .select("total_score average_score judge_name createdAt")
                .lean();

            // Calculate average score from all evaluations
            let averageScore = 0;
            if (evaluations.length > 0) {
                const totalScore = evaluations.reduce((sum, ev) => sum + (ev.average_score || 0), 0);
                averageScore = (totalScore / evaluations.length).toFixed(1);
            }

            // Get PPT link if available
            const pptLink = team.pptSubmission?.pptFile?.filePath || null;

            submissions.push({
                id: team._id,
                teamName: team.teamName,
                teamLeaderEmail: team.email,
                projectName: team.projectTitle || "Untitled Project",
                category: team.category || "Uncategorized",
                averageScore: parseFloat(averageScore) || 0,
                totalEvaluators: evaluations.length,
                submissionDate: team.createdAt,
                pptLink: pptLink,
                abstract: team.projectDescription || "No description available",
                techStack: team.technologyStack || [],
                members: team.members || [],
                pptAnalysis: team.pptSubmission?.analysisResults || null,
            });
        }

        // Sort by average score descending
        submissions.sort((a, b) => b.averageScore - a.averageScore);

        return res
            .status(200)
            .json(new ApiResponse(200, submissions, "Final submissions fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Error fetching final submissions", [
            error.message,
        ]);
    }
});

/**
 * Helper function to get relative time
 */
function getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    return `${days} day${days !== 1 ? "s" : ""} ago`;
}
