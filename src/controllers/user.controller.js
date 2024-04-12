import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import Valid from "../utils/validation.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
   } catch (error) {
      throw new ApiError(
         500,
         "Something went wrong when generating access token and refresh token. "
      );
   }
};

const registerUser = asyncHandler(async (req, res) => {
   // get data from frontend
   const { username, password, fullName, email } = req.body;

   // check fields validation
   if (
      [username, password, fullName, email].some(
         (field) => field?.trim() === ""
      )
   ) {
      throw new ApiError(400, "Please fill all the fields");
   }

   if (
      !Valid.username(username) ||
      !Valid.password(password) ||
      !Valid.email(email) ||
      !Valid.fullName(fullName)
   ) {
      throw new ApiError(400, "Please give valid fields");
   }

   // check user already exists or not
   const existUser = await User.findOne({ $or: [{ username, email }] });
   if (existUser) throw new ApiError(409, "username or email already exists");

   // upload user avatar form cloudinary
   const avatarLocalPath = req.files?.avatar && req.files.avatar[0]?.path;
   const coverImageLocalPath =
      req.files?.coverImage && req.files.coverImage[0]?.path;

   if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

   const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
   const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

   // check successfully uploaded or not
   if (!avatarResponse) throw new ApiError(400, "Avatar file is required");

   // create user
   const user = await User.create({
      password,
      fullName,
      email,
      username: username.toLowerCase(),
      avatar: avatarResponse.url,
      coverImage: coverImageResponse?.url || "",
   });

   // remove password and refresh token
   const createdUser = await User.findById(user).select(
      "-password -refreshToken"
   );

   // check the user successfully created in the database
   if (!createdUser)
      throw new ApiError(500, "Something went wrong creating the user");

   // return response
   await res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
   // get data from frontend
   const { username, email, password } = req.body;

   // check fields validation
   if (!(username || email)) {
      throw new ApiError(400, "Username or email is required");
   }

   if (!password) {
      throw new ApiError(400, "Password is required");
   }

   if ([username, email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "Please fill all the fields");
   }

   // find the user
   const user = await User.findOne({ $or: [{ username }, { email }] });
   if (!user) {
      throw new ApiError(404, "User dons not exist");
   }

   // check passwords validation
   const isValidPassword = await user.isPasswordCurrent(password);
   if (!isValidPassword) {
      throw new ApiError(401, "Invalid password");
   }

   // generate access and refresh tokens
   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

   const options = {
      httpOnly: true,
      secure: true
   }

   // send cookies
   await res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, {
         user: loggedInUser,
         accessToken,
         refreshToken,
      }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user._id, 
      {
         $set: {
            refreshToken: undefined,
         }
      },
      {
         new: true
      }
   );

   const options = {
      httpOnly: true,
      secure: true
   }

   return res.status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
