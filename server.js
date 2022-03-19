const express = require("express");
const cors = require("cors");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const compression = require("compression");
var cookieParser = require("cookie-parser");

const register = require("./controllers/register");
const link = require("./controllers/link");
const admin = require("./controllers/admin");
const subscriber = require("./controllers/subscriber");
const user = require("./controllers/user");
const authentication = require("./controllers/authentication");
const helper = require("./controllers/helper");

var db = require("knex")({
  client: "pg",
  connection: process.env.POSTGRES_URI,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(compression());

app.get("/", (req, res) => {
  res.send(
    "<h1>You are not supposed to be here, but welcome anyway. Dont do anything bad!</h1>"
  );
});

// Path to fetch user data from the database
app.post("/getData", async (req, res) => {
  try {
    const { id } = req.body;
    const userData = await helper.getData(id, db);
    const token = authentication.generateToken(userData.user);

    res.json({ userData, token });
  } catch (error) {
    console.log(error);
  }
});

app.post("/toggleLink", async (req, res) => {
  try {
    link.toggleLink(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

app.post("/setQuota", async (req, res) => {
  try {
    admin.setQuota(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

// Path to register user and set new data in database
app.post("/register", async (req, res) => {
  try {
    register.handleRegistration(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

// Path to save new link's data in database
app.post("/newLink", async (req, res) => {
  try {
    link.newLink(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

// Path to delete link from Database
app.post("/deleteLink", async (req, res) => {
  try {
    link.deleteLink(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

// Path to delete subscriber
app.post("/deleteSubscriber", async (req, res) => {
  try {
    subscriber.deleteSubscriber(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

// Path to get link information
app.post("/getLink", async (req, res) => {
  try {
    link.getLink(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

// Path to register new subscriber to the database
app.post("/addSub", async (req, res) => {
  try {
    subscriber.addSubscriber(req, res, db, mailchimp);
  } catch (error) {
    console.log(error);
  }
});

// Creating a new MailChimp list

app.post("/newMailchimpLink", async (req, res) => {
  try {
    link.addNewMailChimpLink(req, res, db, mailchimp);
  } catch (error) {
    console.log(error);
  }
});

//retreives api key for subscription page
app.post("/getApiKey", async (req, res) => {
  try {
    user.getApiKey(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

//updates user's profile
app.post("/updateData", async (req, res) => {
  try {
    user.updateData(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

app.post("/confirmApiKey", async (req, res) => {
  try {
    user.confirmApiKey(req, res, mailchimp);
  } catch (error) {
    console.log(error);
  }
});

app.post("/customBranding", async (req, res) => {
  try {
    link.customLink(req, res, db);
  } catch (error) {
    console.log(error);
  }
});

app.post("/getCustomBranding", async (req, res) => {
  try {
    link.fetchCustomBranding(req, res, db);
  } catch (error) {
    console.log(error);
  }
});



app.listen(process.env.PORT || 3001, () => {
  console.log("Running the 22/08/2021 update");
});

//=================
