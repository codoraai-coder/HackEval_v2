
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Judge } from "../models/judge/user.model.js";

export const verifyJWTJudge = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.judgeToken || req.header("Authorization")?.replace("Bearer ", "");

    // console.log("JUDGE Token :: ",token);
    

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const judge = await Judge.findById(decodedToken?._id).select("-password -refreshToken");

    if (!judge) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.judge = judge;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});