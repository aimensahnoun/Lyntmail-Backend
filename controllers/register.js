const handleRegistration = async (req, res, db) => {
  const {
    email,
    id,
    full_name,
    api_key,
    subscription,
    href,
    quota,
    subscriber_count,
  } = req.body;
  
  db.transaction((trx) => {
    trx
      .insert({
        email: email,
        id: id,
        full_name: full_name,
        api_key: api_key,
        quota: quota,
        subscription_type: subscription,
        subscriber_count: subscriber_count,
      })
      .into("users")
      .then(() => {
        return trx
          .insert({
            href: href,
            campaign_name: "Default",
            owner_id: id,
            campaign_type: "SwipeMail",
            is_active: "true",
          })
          .into("link");
      })
      .then(trx.commit)
      .catch(trx.rollback);
  });

  res.json("Done");
};

module.exports = {
  handleRegistration: handleRegistration,
};
