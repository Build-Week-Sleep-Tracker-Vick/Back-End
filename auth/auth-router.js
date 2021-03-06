const bcryptjs = require("bcryptjs");

const router = require("express").Router();

const Users = require("./auth-model");
const { isUserValid, generateToken } = require("./auth-service");
const configVars = require("../config/vars");

// Register a new user
router.post("/register", (req, res) => {
  const credentials = req.body;
  if (isUserValid(credentials)) {
    // hash it up
    const hash = bcryptjs.hashSync(credentials.password, configVars.rounds);
    credentials.password = hash;

    // save user to db
    Users.add(credentials)
      .then((user) => {
        res.status(201).json({ data: user });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } else {
    res.status(400).json({
      message:
        "Please provide all the proper credentials. Be sure that they are alphanumeric.",
    });
  }
});

// Login as a user
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (isUserValid(req.body)) {
    Users.findBy({ username })
      .then(([user]) => {
        // compare the password to the hash stored in the db
        if (user && bcryptjs.compareSync(password, user.password)) {
          // produce (sign) and send the token
          const token = generateToken(user);

          res.status(200).json({
            message: "Successful login.",
            token,
            userId: user.id,
          });
        } else {
          res.status(401).json({ message: "Invalid credentials" });
        }
      })
      .catch((err) => {
        res.status({ message: err.message });
      });
  } else {
    status(400).json({
      message:
        "Please provide all the proper credentials. Be sure that they are alphanumeric.",
    });
  }
});

module.exports = router;
