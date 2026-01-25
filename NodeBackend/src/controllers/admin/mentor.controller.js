import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Mentor } from "../../models/admin/mentor.model.js";

// Get all mentors
const getMentors = asyncHandler(async (req, res) => {
  const { category, status, search } = req.query;
  
  let filter = { isActive: true };
  
  // Filter by expertise category
  if (category && category !== 'all') {
    filter.expertise = category;
  }
  
  // Filter by status
  if (status && status !== 'all') {
    filter.status = status;
  }
  
  // Search filter
  if (search) {
    filter.$text = { $search: search };
  }
  
  const mentors = await Mentor.find(filter).sort({ createdAt: -1 });
  
  res.status(200).json(
    new ApiResponse(200, mentors, "Mentors retrieved successfully")
  );
});

// Get single mentor by ID
const getMentorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const mentor = await Mentor.findById(id);
  
  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }
  
  res.status(200).json(
    new ApiResponse(200, mentor, "Mentor retrieved successfully")
  );
});

// Create new mentor
const createMentor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    expertise,
    availability,
    status,
    location,
    bio,
    rating,
    sessions
  } = req.body;
  
  // Validation
  if (!name || !email) {
    throw new ApiError(400, "Name and email are required");
  }
  
  // Check if mentor already exists
  const existingMentor = await Mentor.findOne({ email });
  
  if (existingMentor) {
    throw new ApiError(409, "Mentor with this email already exists");
  }
  
  // Create mentor
  const mentor = await Mentor.create({
    name,
    email,
    phone,
    expertise: expertise || [],
    availability: availability !== undefined ? availability : true,
    status: status || 'active',
    location,
    bio,
    rating: rating || 0,
    sessions: sessions || 0
  });
  
  res.status(201).json(
    new ApiResponse(201, mentor, "Mentor created successfully")
  );
});

// Update mentor
const updateMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const mentor = await Mentor.findById(id);
  
  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }
  
  // Check if email is being changed to an existing one
  if (updates.email && updates.email !== mentor.email) {
    const existingMentor = await Mentor.findOne({ email: updates.email });
    if (existingMentor) {
      throw new ApiError(409, "Mentor with this email already exists");
    }
  }
  
  Object.assign(mentor, updates);
  await mentor.save();
  
  res.status(200).json(
    new ApiResponse(200, mentor, "Mentor updated successfully")
  );
});

// Delete mentor (soft delete)
const deleteMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const mentor = await Mentor.findById(id);
  
  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }
  
  mentor.isActive = false;
  await mentor.save();
  
  res.status(200).json(
    new ApiResponse(200, null, "Mentor deleted successfully")
  );
});

// Toggle mentor availability
const toggleAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const mentor = await Mentor.findById(id);
  
  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }
  
  mentor.availability = !mentor.availability;
  await mentor.save();
  
  res.status(200).json(
    new ApiResponse(200, mentor, "Availability updated successfully")
  );
});

// Add team to mentor
const addTeamToMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teamName } = req.body;
  
  if (!teamName) {
    throw new ApiError(400, "Team name is required");
  }
  
  const mentor = await Mentor.findById(id);
  
  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }
  
  // Check if team already assigned
  if (mentor.assignedTeams.includes(teamName)) {
    throw new ApiError(400, "Team already assigned to this mentor");
  }
  
  mentor.assignedTeams.push(teamName);
  await mentor.save();
  
  res.status(200).json(
    new ApiResponse(200, mentor, "Team added to mentor successfully")
  );
});

// Remove team from mentor
const removeTeamFromMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teamName } = req.body;
  
  if (!teamName) {
    throw new ApiError(400, "Team name is required");
  }
  
  const mentor = await Mentor.findById(id);
  
  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }
  
  // Check if team is assigned
  if (!mentor.assignedTeams.includes(teamName)) {
    throw new ApiError(400, "Team not assigned to this mentor");
  }
  
  mentor.assignedTeams = mentor.assignedTeams.filter(team => team !== teamName);
  await mentor.save();
  
  res.status(200).json(
    new ApiResponse(200, mentor, "Team removed from mentor successfully")
  );
});

// Get mentor statistics
const getMentorStatistics = asyncHandler(async (req, res) => {
  const totalMentors = await Mentor.countDocuments({ isActive: true });
  const availableMentors = await Mentor.countDocuments({ 
    isActive: true, 
    availability: true 
  });
  const assignedTeams = await Mentor.aggregate([
    { $match: { isActive: true } },
    { $project: { teamCount: { $size: "$assignedTeams" } } },
    { $group: { _id: null, total: { $sum: "$teamCount" } } }
  ]);
  
  const totalAssignedTeams = assignedTeams.length > 0 ? assignedTeams[0].total : 0;
  
  res.status(200).json(
    new ApiResponse(200, {
      totalMentors,
      availableMentors,
      totalAssignedTeams
    }, "Statistics retrieved successfully")
  );
});

export {
  getMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  toggleAvailability,
  addTeamToMentor,
  removeTeamFromMentor,
  getMentorStatistics
};