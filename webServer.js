import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
//password hasing via bcrypt
import bcrypt from "bcrypt"; 
//authenication
import session from "express-session";
import dotenv from "dotenv";
import User from './schema/user.js';
import Objects from './schema/objects.js';

dotenv.config();

const app = express();

const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGODB_URI ||
  process.env.MONGO_URL || 'mongodb://localhost:27017/'


// Enable CORS for frontend running on a different port
app.use(cors());

mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function logIn(req, res, next) {
  if (!req.session.userId) { 
    //checks to see if the user is logged in
    return res.status(401).send("Unauthorized"); 
    //return this if not logged in
  }
  return next(); //continues to through the route otherwise
}

/**
 * GET /user/:id
 * Returns the details of one user.
 */
app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const user = await User.findById(
      userId,
      '_id first_name last_name location description occupation',
    ).lean();

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});


/**
 * POST /admin/login
 */
app.post("/admin/login", async (req, res) => {
  const { user_name, password } = req.body;

  if (!user_name || !password) { //checks the login and password
    return res.status(400).send("Missing login information");
  }

  const user = await User.findOne({ user_name }); 
  //looks in the schema for a user

  if (!user) { //if we cannot find them
    return res.status(400).send("User not found");
    //tell the user and back out
  }

  const isMatch = await bcrypt.compare(password, user.password_digest);
  //makes sure the passwords passed match

  if (!isMatch) {
    return res.status(400).send("Invalid password");
    //returns the incorrect password
  }

  req.session.userId = user._id;

  const userObj = user.toObject();
  delete userObj.password_digest;

  return res.json(userObj);
});

/**
 * POST /admin/logout
 */
app.post("/admin/logout", (req, res) => {
  if (!req.session.userId) { //makes sure no user was in
    return res.status(400).send("No user logged in");
    //returns error
  }

  return req.session.destroy(() => {
    res.send("Logged out"); 
    //destroys the user's current session and logs them out
  });
});

app.get("/admin/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Not logged in");
  }

  const user = await User.findById(req.session.userId).lean();
  //tries to find the user logged in
  if (!user) {
    return res.status(400).send("User not found");
  }

  delete user.password_digest;
  //don't keep the password cached
  return res.json(user); //return the user
});

/**
 * POST /user (register)
 */
app.post("/user", async (req, res) => {
  const { //schema details
    user_name,
    password
   } = req.body;
  //stored into req
  if (!user_name || !password) {
    return res.status(400).send("Missing required fields");
    //required fields to make an account
  }

  const existing = await User.findOne({ user_name });
  if (existing) { //if a new user tries to make an account with the same name
    //tell them and stop it. 
    return res.status(400).send("User name already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({//creates the new user
    user_name,
    password_digest: hashedPassword //important we use the correct password
  });

  await newUser.save(); //saves the new user
  const userNoPW = newUser.toObject(); //converts it to an object
  delete userNoPW.password_digest; //deletes the password

  return res.json(userNoPW); //return the user with no password
  
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});