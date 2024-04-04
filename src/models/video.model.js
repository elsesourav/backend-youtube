import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
   title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      index: true,
   },
   description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
   },
   tags: [{ type: String }],
   thumbnail: {
      type: String, // cloudinary image
      required: [true, "Thumbnail is required"],
   },
   videoFile: {
      type: String, // cloudinary url
      required: [true, "Video file is required"],
   },
   owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
   },
   views: {
      type: Number,
      default: 0,
   },
   likes: {
      type: Number,
      default: 0
   },
   duration: {
      type: Number,
      required: [true, "Duration is required"],
   },
   isPublished: {
      type: Boolean,
      default: true,
   },
   comments: [
      {
         type: Schema.Types.ObjectId,
         ref: "Comment",
      }
   ]
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = model("Video", videoSchema);