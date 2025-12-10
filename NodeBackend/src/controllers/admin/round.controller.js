import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Round } from "../../models/admin/round.model.js";

// Get all rounds
const getRounds = asyncHandler(async (req, res) => {
  const rounds = await Round.find().sort({ startTime: 1 });
  
  if (!rounds || rounds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "No rounds found")
    );
  }
  
  res.status(200).json(
    new ApiResponse(200, rounds, "Rounds retrieved successfully")
  );
});

// Create new round
const createRound = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    startTime,
    endTime,
    uploadDeadline,
    status
  } = req.body;
  
  // Validation
  if (!name || !description || !startTime || !endTime || !uploadDeadline) {
    throw new ApiError(400, "All required fields must be provided");
  }
  
  if (new Date(startTime) >= new Date(endTime)) {
    throw new ApiError(400, "End time must be after start time");
  }
  
  if (new Date(uploadDeadline) < new Date(startTime) || new Date(uploadDeadline) > new Date(endTime)) {
    throw new ApiError(400, "Upload deadline must be between start and end time");
  }
  
  // Create round
  const round = await Round.create({
    name,
    description,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    uploadDeadline: new Date(uploadDeadline),
    status: status || 'draft',
    createdBy: req.user._id
  });
  
  res.status(201).json(
    new ApiResponse(201, round, "Round created successfully")
  );
});

// Update round
const updateRound = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const round = await Round.findById(id);
  
  if (!round) {
    throw new ApiError(404, "Round not found");
  }
  
  // Convert date strings to Date objects if provided
  if (updates.startTime) updates.startTime = new Date(updates.startTime);
  if (updates.endTime) updates.endTime = new Date(updates.endTime);
  if (updates.uploadDeadline) updates.uploadDeadline = new Date(updates.uploadDeadline);
  
  Object.assign(round, updates);
  await round.save();
  
  res.status(200).json(
    new ApiResponse(200, round, "Round updated successfully")
  );
});

// Delete round
const deleteRound = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const round = await Round.findByIdAndDelete(id);
  
  if (!round) {
    throw new ApiError(404, "Round not found");
  }
  
  res.status(200).json(
    new ApiResponse(200, null, "Round deleted successfully")
  );
});

export {
  getRounds,
  createRound,
  updateRound,
  deleteRound
};