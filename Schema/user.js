import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Name of the file containing the photo (images directory).
  user_name: {
    type: String, //username basically
    required: true, //everyone needs to have a name
    unique: true, //no repeating names
    trim: true //trim excess spacess
  },
  high_score_object: { 
    type: [Number], 
    default : [] 
    }, 
  high_score_pokemon: { 
    type: [Number], 
    default : [] 
    }, 
  password_digest:{
    type: String, //string for the user 
    required: true, //needs to be there
  }
});

/**
 * Create a Mongoose Model for a Photo using the photoSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
export default User;
