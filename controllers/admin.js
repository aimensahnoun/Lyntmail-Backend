const setQuota = async (req, res, db) => {
  const { email, quota, password } = req.body;
  if (password != process.env.PASSWORD) {
    res.json("You are not autherised to do this!");
  } else {
    const id = await db.select("id").from("users").where("email", email);
    await db("users").where("email", "=", email).update({
      quota: quota,
    });
    await disableLinks(id[0].id, quota);
    res.json(`Quota has been update to ${quota}`);
  }
};

//========================================================

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
  setQuota: setQuota,
};
