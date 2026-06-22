import mongoose from "mongoose";

const objectSchema = new mongoose.Schema({
  // Name of the file containing the photo (images directory).
  object_name: String,
  // The date and time when the photo was added to the database.
  weight: Number, 
  // The ID of the user who created the photo.
  //Added in to take cloudinary links
  photo_url: String,
  // Array of users who liked this photo

});

/**
 * Create a Mongoose Model for a Photo using the photoSchema.
 */
const Objects = mongoose.model("Objects", objectSchema);

/**
 * Make this available to our application.
 */
export default Objects;