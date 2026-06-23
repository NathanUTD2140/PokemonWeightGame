import mongoose from "mongoose";
import dotenv from "dotenv";
import Bluebird from "bluebird";

//schemas from mongoose
import User from "./Schema/user.js";
import Objects from "./Schema/objects.js";

dotenv.config();

mongoose.Promise = Bluebird;
mongoose.set("strictQuery", false);
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1/PokemonWeightGame"

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const removePromises = [
  User.deleteMany({}),
  Objects.deleteMany({}),
];

Promise.all(removePromises).then(async function() {
    const testingUser = await User.create({
        user_name: "test",
        high_score: [7, 5, 4],
        password_digest: "password",
    });
    
    await testingUser.save();
    console.log("Created test user", testingUser);
    
    const testingObject = await Objects.create({
      object_name: "Folding table",
      weight: 15,
      photo_url: "https://res.cloudinary.com/dsjwxt5b1/image/upload/v1782159763/image_2026-06-22_152242619_jpxnyc.png",
    });

    await testingObject.save();
    console.log("Created test object:", testingObject);
    
    mongoose.disconnect();
    
  })

  .catch(function (err) {
    console.error(err);
  });