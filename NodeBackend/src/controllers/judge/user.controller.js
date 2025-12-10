import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import { Judge } from "../../models/judge/user.model.js";

const generateAccessAndRefreshTokens = async (judgeId) => {
  try {
    const judge = await Judge.findById(judgeId);
    const accessToken = judge.generateAccessToken();
    const refreshToken = judge.generateRefreshToken();

    judge.refreshToken = refreshToken;
    await judge.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const judgeRegister = asyncHandler(async (req, res) => {
  const { username, password, name, email, expertise, bio } = req.body;

  if ([username, password, name, email].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existingJudge = await Judge.findOne({
    $or: [{ username }, { email }]
  });

  if (existingJudge) {
    throw new ApiError(409, "Judge with username or email already exists");
  }

  const judge = await Judge.create({
    username: username.toLowerCase(),
    password,
    name,
    email: email.toLowerCase(),
    expertise: expertise ? expertise.split(',').map(item => item.trim()) : [],
    bio: bio || ''
  });

  const createdJudge = await Judge.findById(judge._id).select("-password -refreshToken");

  if (!createdJudge) {
    throw new ApiError(500, "Something went wrong while registering the judge");
  }

  return res.status(201).json(
    new ApiResponse(200, createdJudge, "Judge registered successfully")
  );
});

const judgeLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  const judge = await Judge.findOne({ username: username.toLowerCase() });

  if (!judge) {
    throw new ApiError(404, "Judge does not exist");
  }

  const isPasswordValid = await judge.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(judge._id);

  const loggedInJudge = await Judge.findById(judge._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          judge: loggedInJudge,
          accessToken,
          refreshToken
        },
        "Judge logged in successfully"
      )
    );
});

const judgeLogout = asyncHandler(async (req, res) => {
  await Judge.findByIdAndUpdate(
    req.judge._id,
    {
      $set: {
        refreshToken: null
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Judge logged out successfully"));
});

const getCurrentJudge = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.judge, "Current judge fetched successfully"));
});

export {
  judgeRegister,
  judgeLogin,
  judgeLogout,
  getCurrentJudge
};
