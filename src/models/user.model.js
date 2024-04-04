import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
   username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username is already exists"],
      trim: true,
      lowercase: true,
      index: true,
   },
   email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email is already exists"],
      trim: true,
      lowercase: true
   },
   fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
      index: true,
   },
   avatar: {
      type: String, // cloudinary image
      required: [true, "Avatar is required"],
   },
   coverImage: {
      type: String, // cloudinary image
   },
   watchHistory: [
      {
         type: Schema.Types.ObjectId,
         ref: "Video",
      }
   ],
   password: {
      type: String,
      required: [true, "Password is required"]
   },
   refreshToken: {
      type: String,
   }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return next();

   this.password = await bcrypt.hash(this.password, 9);
   next();
});

userSchema.methods.isPasswordCurrent = async function(password) {
   return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
   return jwt.sign(
      {
         _id: this._id,
         email: this.email,
         username: this.username,
         fullName: this.fullName
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
   );
}

userSchema.methods.generateRefreshToken = function() {
   return jwt.sign(
      { _id: this._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
   );
}

export const User = model("User", userSchema);
