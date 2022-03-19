const { JsonWebTokenError } = require("jsonwebtoken");
const authentication = require("./authentication");

const getApiKey = async (req, res, db) => {
  const { owner_id } = req.body;
  try {
    const apiKey = await db
      .select("api_key")
      .from("users")
      .where("id", owner_id)
      .then((data) => {
        return data[0];
      });
    res.json(apiKey);
  } catch (error) {
    console.log(error);
  }
};

const updateData = async (req, res, db) => {
  const { userId, email, apiKey, fullName } = req.body;

  const token = req.headers["authorization"].split(" ")[1];
  var payload;
  if (!token) return res.status(401).end();
  try {
    payload = authentication.verifyToken(token);
  } catch (e) {
    if (e instanceof JsonWebTokenError) return res.status(401).end();
    return res.status(400).end();
  }

  const { id } = payload;
  if (id != userId) return res.status(401).end();

  try {
    await db("users")
      .update("email", email)
      .update("api_key", apiKey)
      .update("full_name", fullName)
      .where("id", userId);
    res.json("Done");
  } catch (error) {
    console.log(error);
  }
};

const confirmApiKey = async (req, res, mailchimp) => {
  const { apiKey, userId } = req.body;

  const token = req.headers["authorization"].split(" ")[1];
  var payload;
  if (!token) return res.status(401).end();
  try {
    payload = authentication.verifyToken(token);
  } catch (e) {
    if (e instanceof JsonWebTokenError) return res.status(401).end();
    return res.status(400).end();
  }

  const { id } = payload;
  if (id != userId) return res.status(401).end();

  try {
    splitApi = apiKey.split("-");

    mailchimp.setConfig({
      apiKey: splitApi[0],
      server: splitApi[1],
    });
    await mailchimp.ping.get();

    res.json("valid");
  } catch (error) {
    res.json("invalid");
  }
};

module.exports = {
  getApiKey: getApiKey,
  updateData: updateData,
  confirmApiKey: confirmApiKey,
};
