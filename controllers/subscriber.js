const { JsonWebTokenError } = require("jsonwebtoken");
const authentication = require("./authentication");

const deleteSubscriber = async (req, res, db) => {
  const { sub_id, userId } = req.body;

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
    await db("subscriber").where("sub_id", sub_id).del();
    res.json("Deleted");
  } catch (error) {
    console.log(error);
  }
};

//=======================================================

const addSubscriber = async (req, res, db, mailchimp) => {
  const {
    campaign_name,
    email,
    full_name,
    phone_number,
    subscribed_to,
    list_id,
    type,
    date,
    href,
  } = req.body;

  if (type === "MailChimp") {
    const apiKey = await db
      .select("api_key")
      .from("users")
      .where("id", subscribed_to)
      .then((data) => {
        return data[0];
      });
    splitApi = apiKey.api_key.split("-");
    console.log(splitApi);
    try {
      mailchimp.setConfig({
        apiKey: splitApi[0],
        server: splitApi[1],
      });
    } catch (error) {
      console.log(error);
    }
    splitName = full_name.split(" ");

    const response = await mailchimp.lists.batchListMembers(list_id, {
      members: [
        {
          email_address: email,
          email_type: "text",
          status: "subscribed",
          merge_fields: {
            FNAME: splitName[0],
            LNAME: splitName[1],
            PHONE: phone_number,
          },
        },
      ],
    });

    if (response.errors.length === 0) {
      await db("users")
        .where("id", "=", subscribed_to)
        .increment("subscriber_count", 1);
      await db("users").where("id", "=", subscribed_to).decrement("quota", 1);
      const quota = await db
        .select("quota")
        .where("id", "=", subscribed_to)
        .from("users");
      if (quota[0].quota === "0") {
        disableLinks(subscribed_to, quota[0].quota);
      }
      res.json("Done");
    } else if (response.errors[0].error.includes("already a list member")) {
      res.json("already exists");
    }
  } else {
    try {
      await db("subscriber").insert({
        campaign_name,
        email,
        full_name,
        phone_number,
        subscribed_to,
        date,
        href,
      });
      await db("stats").insert({
        campaign_name,
        subscribed_to,
        date,
        href,
      });

      await db("users")
        .where("id", "=", subscribed_to)
        .increment("subscriber_count", 1);
      await db("users").where("id", "=", subscribed_to).decrement("quota", 1);
      const quota = await db
        .select("quota")
        .where("id", "=", subscribed_to)
        .from("users");
      if (quota[0].quota === "0") {
        disableLinks(subscribed_to, quota[0].quota);
      }
      res.json("Done");
    } catch (error) {
      res.json(error.detail);
    }
  }
};

//=======================================================

const disableLinks = async (id, count) => {
  if (count == 0) {
    await db("link").where("owner_id", "=", id).update({
      is_active: "false",
    });
  } else {
    await db("link").where("owner_id", "=", id).update({
      is_active: "true",
    });
  }
};

module.exports = {
  deleteSubscriber: deleteSubscriber,
  addSubscriber: addSubscriber,
};
