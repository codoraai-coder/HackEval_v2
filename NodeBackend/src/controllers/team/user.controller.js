import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Team } from "../../models/team/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessToken = (teamId) => {
  return jwt.sign({ teamId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "24h",
  });
};

const teamRegister = asyncHandler(async (req, res) => {
  const {
    teamName,
    email,
    password,
    members,
    projectTitle,
    projectDescription,
    technologyStack,
    category,
  } = req.body;

  // Validation
  if (!teamName || !email || !password) {
    throw new ApiError(400, "Team name, email, and password are required");
  }

  if (!members || members.length === 0) {
    throw new ApiError(400, "At least one team member is required");
  }

  // Check if team already exists
  const existingTeam = await Team.findOne({
    $or: [{ teamName }, { email }],
  });

  if (existingTeam) {
    throw new ApiError(409, "Team with this name or email already exists");
  }

  // Create team
  const team = await Team.create({
    teamName,
    email,
    password,
    members,
    projectTitle,
    projectDescription,
    technologyStack,
    category,
  });

  const createdTeam = await Team.findById(team._id);
  if (!createdTeam) {
    throw new ApiError(500, "Something went wrong while registering the team");
  }

  // Generate token
  const token = generateAccessToken(createdTeam._id);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        team: createdTeam,
        accessToken: token,
      },
      "Team registered successfully",
    ),
  );
});

const teamLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const team = await Team.findOne({ email });
  console.log("Team:", team);
  if (!team) {
    console.log("Team not found");
    throw new ApiError(404, "Team not found");
  }

  const isPasswordValid = await team.comparePassword(password);
  if (!isPasswordValid) {
    console.log("Invalid credentials");
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateAccessToken(team._id);
  console.log("Team Login, Token Generated", token);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        team,
        accessToken: token,
      },
      "Login successful",
    ),
  );
});

const getCurrentTeam = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.team, "Team retrieved successfully"));
});

export { teamRegister, teamLogin, getCurrentTeam };
