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
    subcategory,
    universityRollNo,
    problemStatement, // optional; may be provided by frontend
  } = req.body;

  // Validation
  if (!teamName || !email || !password) {
    throw new ApiError(400, "Team name, email, and password are required");
  }
  if (!members || members.length === 0) {
    throw new ApiError(400, "At least one team member is required");
  }

  // Uniqueness
  const existingTeam = await Team.findOne({ $or: [{ teamName }, { email }] });
  if (existingTeam) {
    throw new ApiError(409, "Team with this name or email already exists");
  }

  // Build a normalized problemStatement if not provided
  const normalizedPS =
    problemStatement && typeof problemStatement === "object"
      ? {
          title: problemStatement.title || projectTitle || "",
          description: problemStatement.description || projectDescription || "",
          category: problemStatement.category || category || "",
          ps_id: problemStatement.ps_id || "", // optional
        }
      : {
          title: projectTitle || "",
          description: projectDescription || "",
          category: category || "",
          ps_id: "",
        };

  // Ensure first member is leader server-side as well
  const normalizedMembers = members.map((m, i) => ({
    name: m.name,
    email: m.email,
    phone: m.phone,
    rollNo: m.rollNo || "",
    isLeader: i === 0,
  }));

  // Create team
  const team = await Team.create({
    teamName,
    email,
    password,
    members: normalizedMembers,
    projectTitle,
    projectDescription,
    technologyStack,
    category,
    subcategory,
    universityRollNo,
    problemStatement: normalizedPS,
  });

  const createdTeam = await Team.findById(team._id);
  if (!createdTeam) {
    throw new ApiError(500, "Something went wrong while registering the team");
  }

  const token = generateAccessToken(createdTeam._id);

  // createdTeam.toJSON removes password
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { team: createdTeam.toJSON(), accessToken: token },
        "Team registered successfully",
      ),
    );
});

const teamLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const team = await Team.findOne({ email });
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
