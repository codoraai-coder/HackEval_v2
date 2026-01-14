import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { RoundState } from "../../models/admin/roundState.model.js";
import { Round } from "../../models/admin/round.model.js";

// Get active round
export const getActiveRound = asyncHandler(async (req, res) => {
  try {
    const activeRound = await RoundState.findOne({ isActive: true })
      .populate('roundId', 'name description status')
      .lean();

    if (!activeRound) {
      return res.status(200).json(
        new ApiResponse(200, { round: null }, "No active round set")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, { round: activeRound.round, data: activeRound }, "Active round fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching active round: " + error.message);
  }
});

// Set active round
export const setActiveRound = asyncHandler(async (req, res) => {
  const { round } = req.body;

  if (!round || typeof round !== 'string') {
    throw new ApiError(400, "Round name is required and must be a string");
  }

  try {
    // Verify round exists in Round model
    const roundExists = await Round.findOne({ name: round });
    if (!roundExists) {
      throw new ApiError(404, `Round "${round}" does not exist`);
    }

    // Deactivate all other rounds
    await RoundState.updateMany({ isActive: true }, { isActive: false });

    // Create or update the active round
    let roundState = await RoundState.findOne({ round });
    
    if (roundState) {
      roundState.isActive = true;
      roundState.activeAt = new Date();
      await roundState.save();
    } else {
      roundState = await RoundState.create({
        round,
        roundId: roundExists._id,
        isActive: true,
        activeAt: new Date()
      });
    }

    return res.status(200).json(
      new ApiResponse(200, { round: roundState.round, data: roundState }, "Active round set successfully")
    );
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw new ApiError(500, "Error setting active round: " + error.message);
  }
});

// Get all round states
export const getAllRoundStates = asyncHandler(async (req, res) => {
  try {
    const roundStates = await RoundState.find()
      .populate('roundId', 'name description status')
      .lean();

    return res.status(200).json(
      new ApiResponse(200, roundStates, "All round states fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching round states: " + error.message);
  }
});

// Delete round state
export const deleteRoundState = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "ID is required");
  }

  try {
    const deletedRoundState = await RoundState.findByIdAndDelete(id);

    if (!deletedRoundState) {
      throw new ApiError(404, "Round state not found");
    }

    return res.status(200).json(
      new ApiResponse(200, deletedRoundState, "Round state deleted successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error deleting round state: " + error.message);
  }
});
