const { JsonWebTokenError } = require("jsonwebtoken");
const authentication = require("./authentication");

const toggleLink = async (req, res, db) => {
  const { userId, href, status } = req.body;

  const token = req.headers["authorization"].split(" ")[1];
  var payload;
  if (!token) return res.status(401).end();
  try {
    payload = authentication.verifyToken(token);
  } catch (e) {
    if (e instanceof JsonWebTokenError) return res.status(401).end();
    return res.status(400).end();
  }

  const { quota, id } = payload;

  if (id != userId) return res.status(401).end();

  if (quota == 0 && status === false) {
    res.json("Full quota");
  } else if (status === false) {
    await db("link").where("href", "=", href).update({
      is_active: "true",
    });
  } else {
    await db("link").where("href", "=", href).update({
      is_active: "false",
    });
  }

  res.json("Updated");
};

//=======================================================

const newLink = async (req, res, db) => {
  const { name, owner_id, href, type, is_active } = req.body;

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
  if (id != owner_id) return res.status(401).end();
  try {
    await db("link").insert({
      owner_id,
      campaign_name: name,
      campaign_type: type,
      href,
      is_active,
    });
    res.json("Done");
  } catch (error) {
    res.json(error.detail);
    console.log(error);
  }
};

//=======================================================

const deleteLink = async (req, res, db) => {
  const { href, userId } = req.body;

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
    await db("link").where("href", href).del();
    res.json("Deleted");
  } catch (error) {
    console.log(error);
  }
};

//=======================================================

const getLink = async (req, res, db) => {
  const { href } = req.body;
  try {
    const linkData = await db
      .select("*")
      .from("link")
      .where("href", href)
      .then((data) => {
        return data;
      });

    res.json(linkData);
  } catch (error) {
    console.log(error);
  }
};

//=======================================================

const addNewMailChimpLink = async (req, res, db, mailchimp) => {
  const { apiKey, name, owner_id, href, is_active } = req.body;

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
  if (id != owner_id) return res.status(401).end();

  splitApi = apiKey.split("-");
  mailchimp.setConfig({
    apiKey: splitApi[0],
    server: splitApi[1],
  });
  try {
    const response = await mailchimp.lists.createList({
      name: name,
      permission_reminder: "permission_reminder",
      email_type_option: false,
      contact: {
        company: "company",
        address1: "address1",
        city: "city",
        state: "state",
        zip: "zip",
        country: "country",
      },
      campaign_defaults: {
        from_name: "from_name",
        from_email: "Renee_Weimann@yahoo.com",
        subject: "subject",
        language: "language",
      },
    });
    await db("link").insert({
      owner_id,
      campaign_name: name,
      campaign_type: "MailChimp",
      list_id: response.id,
      href,
      is_active,
    });
    res.json("Created");
  } catch (error) {
    console.log(error.message);
    res.json(error.message);
  }
};

//=======================================================

const customLink = async (req, res, db) => {
  const { title, message, redirectLink, imageUrl, linkID, owner_id } = req.body;

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
  if (id != owner_id) return res.status(401).end();

  try {
    const result = await db
      .select()
      .from("customdata")
      .where("ownerID", linkID)
      .then((data) => data[0]);

    if (result === undefined) {
      await db("customdata").insert({
        title,
        message,
        redirectURL: redirectLink,
        customlogourl: imageUrl,
        ownerID: linkID,
      });
    } else {
      await db("customdata")
        .update("title", title)
        .update("message", message)
        .update("redirectURL", redirectLink)
        .update("customlogourl", imageUrl)
        .where("ownerID", linkID);
    }
    res.json("Done");
  } catch (error) {
    res.json(error.message);
  }
};

//=======================================================

const fetchCustomBranding = async (req, res, db) => {
  const { linkID, owner_id } = req.body;
  try {

   
      let result = await db
        .select("*")
        .from("customdata")
        .where("ownerID", linkID || 0)
        .then((data) => data[0]);
    

    if (result === undefined) {
      result = await db
        .select("*")
        .from("customdata")
        .where("ownerID", owner_id || 0)
        .then((data) => data[0]);
    }

    console.log(result);

    res.json(result);
  } catch (error) {
    res.json(error.message);
  }
};

module.exports = {
  toggleLink: toggleLink,
  newLink: newLink,
  deleteLink: deleteLink,
  getLink: getLink,
  addNewMailChimpLink: addNewMailChimpLink,
  customLink: customLink,
  fetchCustomBranding: fetchCustomBranding,
};
