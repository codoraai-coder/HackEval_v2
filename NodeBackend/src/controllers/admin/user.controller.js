// import { asyncHandler } from "../../utils/asyncHandler.js";
// import { ApiError } from "../../utils/ApiError.js";
// import { User } from "../../models/admin/user.modle.js";
// import { ApiResponse } from "../../utils/ApiResponce.js";
// import jwt from "jsonwebtoken";
// import { request } from "express";

// const generateAccessAndRefereshTokens = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accessToken = user.generateAccessToken();
//     console.log("not defined yet");
//     const refreshToken = user.generateRefressToken();

//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false }); // jab ham save karte hai to fields active ho jati hai or password bali password magti hai use nahi karna pade to ham -- validateBeforeSave - false

//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new ApiError(
//       500,
//       "Something went wrong while generating referesh and access token",
//     );
//   }
// };

// const adminRegisterUser = asyncHandler(async (req, res) => {
//   const { fullName, email, password } = req.body;

//   if ([fullName, email, password].some((field) => field?.trim() === "")) {
//     throw new ApiError(400, "All fields are required.");
//   }

//   const existedUser = await User.findOne({
//     // operaters == you can use operaters by using sign($)
//     $or: [{ email }], // jitni value chek karni hai bo sabhi check kar lo object ke andar
//   });

//   if (existedUser) {
//     throw new ApiError(409, "User with email or username already exists");
//   }

//   const user = await User.create({
//     fullName,
//     email,
//     password,
//   });

//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken",
//   );

//   if (!createdUser) {
//     throw new ApiError(
//       500,
//       "somtethign went wrong wrong white registering the user ",
//     );
//   }

//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "User registered successfully"));
// });

// const adminLoginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!password || !email) {
//     throw new ApiError(400, "username or email is required");
//   }

//   const user = await User.findOne({
//     $or: [{ email }],
//   });

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   const isPasswordValid = await user.isPasswordCorrect(password);

//   if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid user credentials");
//   }

//   const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
//     user._id,
//   );

//   const loggedInUser = await User.findById(user._id).select(
//     "-password -refreshToken",
//   );

//   // cookies setup

//   const options = {
//     httpOnly: true,
//     secure: true,
//   };

//   return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//       new ApiResponse(
//         200,
//         {
//           user: loggedInUser,
//           accessToken,
//           refreshToken,
//         },
//         "User logged in successfully",
//       ),
//     );
// });

// const adminLogoutUser = asyncHandler(async (req, res) => {
//   // how user come here

//   await User.findByIdAndUpdate(
//     req.user._id,
//     {
//       $set: {
//         refreshToken: undefined,
//       },
//     },
//     {
//       new: true,
//     },
//   );

//   const options = {
//     httpOnly: true,
//     secure: true,
//   };

//   return res
//     .status(200)
//     .clearCookie("accessToken", options)
//     .clearCookie("refressToken", options)
//     .json(new ApiResponse(200, {}, "User logged Out"));
// });

// const refreshAccessToken = asyncHandler(async (req, res) => {
//   try {
//     const incomingRefreshToken =
//       req.cookies.refreshToken || request.body.refreshToken;

//     if (!incomingRefreshToken) {
//       throw new ApiError(401, "unauthorized request");
//     }

//     // jwt give decoded token check website as well
//     const decodedToken = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET,
//     );

//     const user = await User.findById(decodedToken?._id);

//     if (!user) {
//       throw new ApiError(401, "Invalid refresh token");
//     }

//     if (incomingRefreshToken !== user?.refreshToken) {
//       throw new ApiError(401, "Refresh token is expired or used");
//     }

//     const options = {
//       httOnly: true,
//       secure: true,
//     };

//     const { accessToken, newRefreshToken } =
//       await generateAccessAndRefereshTokens(user._id);

//     return res
//       .state(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("accessToken", newRefreshToken, options)
//       .json(
//         new ApiResponse(
//           200,
//           { accessToken: refreshTokne },
//           "Access token refreshed",
//         ),
//       );
//   } catch (error) {
//     throw new ApiError(401, error?.message || "Invalid refresh token");
//   }
// });

// const changeCurrentPassword = asyncHandler(async (req, res) => {
//   const { oldPassword, newPassword } = req.body;
//   console.log(oldPassword, newPassword);

//   const user = await User.findById(req.user?._id);

//   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

//   if (!isPasswordCorrect) {
//     throw new ApiError(400, "Invalid Old Password");
//   }

//   user.password = newPassword;
//   user.save({ validateBeforeSave: false });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Password Changed Successfully"));
// });

// const getCurrentUser = asyncHandler(async (req, res) => {
//   return res
//     .status(200)
//     .json(new ApiResponse(200, req.user, "Current User fetched successfully"));
// });

// const updateAccountDetails = asyncHandler(async (req, res) => {
//   const { fullName, email } = req.body;

//   if (!fullName || !email) {
//     return new ApiError(400, "All Fields Required");
//   }

//   const user = await User.findByIdAndUpdate(
//     req.user._id,
//     {
//       $set: {
//         fullName,
//         email: email,
//       },
//     },
//     { new: true },
//   ).select("-password");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Account Details updated successfully"));
// });

// export {
//   adminRegisterUser,
//   adminLoginUser,
//   adminLogoutUser,
//   refreshAccessToken,
//   changeCurrentPassword,
//   getCurrentUser,
//   updateAccountDetails,
// };
























import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "../../models/admin/user.modle.js";
import { ApiResponse } from "../../utils/ApiResponce.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(); // Fixed method name

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

const adminRegisterUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required.");
  }

  // Fixed: Removed username check since it's not in the schema
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user",
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const adminLoginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

const adminLogoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null, // Changed from undefined to null
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options) // Fixed typo
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken; // Fixed variable name

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true, // Fixed typo
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200) // Fixed method name
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options) // Fixed cookie name
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken }, // Fixed variable name
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully")); // Don't send user object with password
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All Fields Required"); // Fixed to throw error
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details updated successfully"));
});

export {
  adminRegisterUser,
  adminLoginUser,
  adminLogoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
};