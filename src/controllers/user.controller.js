import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import Valid from "../utils/validation.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
   // get data from frontend
   const { username, password, fullName, email } = req.body;

   // check fields validation
   if (
      [username, password, fullName, email].some(
         (field) => field?.trim() !== ""
      )
   ) {
      throw new ApiError(400, "Please fill all the fields");
   }

   if (
      Valid.username(username) ||
      Valid.password(password) ||
      Valid.email(email) ||
      Valid.fullName(fullName)
   ) {
      throw new ApiError(400, "Please give valid fields");
   }

   // check user already exists or not
   const existUser = await User.findOne({ $or: [{ username, email }] });
   if (existUser) throw new ApiError(409, "username or email already exists");

   // upload user avatar form cloudinary
   const avatarLocalPath = await req.files?.avatar[0]?.path;
   const coverImageLocalPath = await req.files?.coverImage[0]?.path;

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
      coverImage: coverImageResponse.url || "",
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

export { registerUser };
