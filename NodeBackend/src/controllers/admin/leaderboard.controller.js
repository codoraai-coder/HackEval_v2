import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Leaderboard } from "../../models/admin/leaderboard.model.js";

// Get all leaderboard entries (PPT scores)
export const getLeaderboard = asyncHandler(async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ rank: 1 })
      .populate('teamId', 'teamName category')
      .lean();

    if (!leaderboard || leaderboard.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, [], "No leaderboard entries found")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, leaderboard, "Leaderboard fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching leaderboard: " + error.message);
  }
});

// Get leaderboard by rank range
export const getLeaderboardByRange = asyncHandler(async (req, res) => {
  const { top } = req.query;
  const limit = top ? parseInt(top) : 10;

  try {
    const leaderboard = await Leaderboard.find()
      .sort({ rank: 1 })
      .limit(limit)
      .populate('teamId', 'teamName category')
      .lean();

    return res.status(200).json(
      new ApiResponse(200, leaderboard, `Top ${limit} leaderboard entries fetched`)
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching leaderboard: " + error.message);
  }
});

// Create or update leaderboard entry
export const createOrUpdateLeaderboardEntry = asyncHandler(async (req, res) => {
  const { teamId, teamName, rank, score, category, innovationCreativity, technicalFeasibility, potentialImpact, fileName } = req.body;

  if (!teamName || rank === undefined || score === undefined) {
    throw new ApiError(400, "Team name, rank, and score are required");
  }

  if (rank < 1) {
    throw new ApiError(400, "Rank must be a positive number");
  }

  if (score < 0) {
    throw new ApiError(400, "Score cannot be negative");
  }

  try {
    let leaderboardEntry = await Leaderboard.findOne({ teamId: teamId || teamName });

    if (leaderboardEntry) {
      // Update existing entry
      leaderboardEntry.rank = rank;
      leaderboardEntry.score = score;
      leaderboardEntry.category = category || leaderboardEntry.category;
      leaderboardEntry.innovationCreativity = innovationCreativity || leaderboardEntry.innovationCreativity;
      leaderboardEntry.technicalFeasibility = technicalFeasibility || leaderboardEntry.technicalFeasibility;
      leaderboardEntry.potentialImpact = potentialImpact || leaderboardEntry.potentialImpact;
      leaderboardEntry.fileName = fileName || leaderboardEntry.fileName;
      leaderboardEntry.updatedAt = new Date();
      
      await leaderboardEntry.save();
    } else {
      // Create new entry
      leaderboardEntry = await Leaderboard.create({
        teamId,
        teamName,
        rank,
        score,
        category,
        innovationCreativity,
        technicalFeasibility,
        potentialImpact,
        fileName
      });
    }

    return res.status(201).json(
      new ApiResponse(201, leaderboardEntry, "Leaderboard entry saved successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error saving leaderboard entry: " + error.message);
  }
});

// Bulk upload leaderboard from Excel
export const bulkUploadLeaderboard = asyncHandler(async (req, res) => {
  const { entries } = req.body;

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    throw new ApiError(400, "Entries array is required and must not be empty");
  }

  try {
    const uploadedEntries = [];
    
    for (const entry of entries) {
      const { teamName, rank, score, category, innovationCreativity, technicalFeasibility, potentialImpact, fileName } = entry;

      if (!teamName || rank === undefined || score === undefined) {
        continue; // Skip invalid entries
      }

      const leaderboardEntry = await Leaderboard.findOneAndUpdate(
        { teamName },
        {
          rank,
          score,
          category,
          innovationCreativity,
          technicalFeasibility,
          potentialImpact,
          fileName,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      uploadedEntries.push(leaderboardEntry);
    }

    return res.status(200).json(
      new ApiResponse(200, uploadedEntries, `${uploadedEntries.length} leaderboard entries uploaded successfully`)
    );
  } catch (error) {
    throw new ApiError(500, "Error uploading leaderboard: " + error.message);
  }
});

// Delete leaderboard entry
export const deleteLeaderboardEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "ID is required");
  }

  try {
    const deletedEntry = await Leaderboard.findByIdAndDelete(id);

    if (!deletedEntry) {
      throw new ApiError(404, "Leaderboard entry not found");
    }

    return res.status(200).json(
      new ApiResponse(200, deletedEntry, "Leaderboard entry deleted successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error deleting leaderboard entry: " + error.message);
  }
});

// Clear all leaderboard entries
export const clearLeaderboard = asyncHandler(async (req, res) => {
  try {
    const result = await Leaderboard.deleteMany({});

    return res.status(200).json(
      new ApiResponse(200, result, "Leaderboard cleared successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error clearing leaderboard: " + error.message);
  }
});
