import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Team } from "../models/team/user.model.js";

// export const verifyTeamJWT = asyncHandler(async (req, res, next) => {
//   try {
//     // Get token from multiple sources
//     let token = req.cookies?.teamToken ||
//                 req.cookies?.accessToken ||
//                 req.header("Authorization")?.replace("Bearer ", "") ||
//                 req.body?.token;

//     console.log("Token received:", token ? "Present" : "Missing");

//     if (!token) {
//       throw new ApiError(401, "Authentication token required");
//     }

//     // Clean the token
//     token = token.trim();

//     // Basic JWT format validation
//     if (!token.includes('.')) {
//       throw new ApiError(401, "Invalid token format - not a JWT");
//     }

//     const tokenParts = token.split('.');
//     if (tokenParts.length !== 3) {
//       throw new ApiError(401, "Invalid JWT structure");
//     }

//     // Verify the token
//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     console.log("Decoded token:", decodedToken);

//     // Find team by ID
//     const team = await Team.findById(decodedToken.teamId || decodedToken._id);

//     if (!team) {
//       throw new ApiError(401, "Team not found - invalid token");
//     }

//     req.team = team;
//     next();
//   } catch (error) {
//     console.error("Auth Error:", error.message);

//     if (error.name === 'JsonWebTokenError') {
//       throw new ApiError(401, "Invalid or malformed token");
//     } else if (error.name === 'TokenExpiredError') {
//       throw new ApiError(401, "Token has expired");
//     } else if (error.name === 'NotBeforeError') {
//       throw new ApiError(401, "Token not yet active");
//     } else {
//       throw new ApiError(401, "Authentication failed");
//     }
//   }
// });

export const verifyTeamJWT = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded?.teamId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    const team = await Team.findById(decoded.teamId);
    if (!team) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid session" });
    }

    req.team = team.toJSON(); // strips password
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
