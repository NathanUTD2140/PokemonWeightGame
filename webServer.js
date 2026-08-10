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
// Comma-separated origins, e.g. http://localhost:3000,https://your-app.vercel.app
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.FRONTEND_URL ||
  'http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);


app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true only when serving over HTTPS in production
      sameSite: 'lax',
    },
  }),
);

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
      '_id user_name high_score'
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

/**
 * POST /user/:id/score
 * Appends a finished round's score to the logged-in user's high_score array.
 */
app.post('/user/:id/score', logIn, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    // only allow a user to update their own score, not someone else's
    if (req.session.userId.toString() !== userId) {
      return res.status(403).send('Forbidden');
    }

    const { score } = req.body;

    if (typeof score !== 'number' || Number.isNaN(score)) {
      return res.status(400).send('Invalid score');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { high_score: score } },
      { new: true },
    ).lean();

    if (!user) {
      return res.status(404).send('User not found');
    }

    delete user.password_digest;
    return res.json(user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});