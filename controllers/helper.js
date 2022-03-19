const getData = async (userId, db) => {
  try {
    const links = await db
      .select("*")
      .from("link")
      .where("owner_id", userId)
      .then((data) => {
        return data;
      });
    const mailChimpLinkCount = await db
      .count("*")
      .from("link")
      .where("owner_id", userId)
      .where("campaign_type", "=", "MailChimp");
    const user = await db.select("*").from("users").where("id", userId);
    const userData = {
      id: await user[0].id,
      full_name: await user[0].full_name,
      email: await user[0].email,
      quota: await user[0].quota,
      subscriber_count: await user[0].subscriber_count,
      subscription_type: await user[0].subscription_type,
      api_key: await user[0].api_key,
      totalLink: links.length,
      mailChimpLink: mailChimpLinkCount[0].count,
    };
    const subscribers = await db
      .select("*")
      .from("subscriber")
      .where("subscribed_to", userId)
      .then((data) => {
        return data;
      });
    const pieChart = await getPieChartData(userId, db);
    const lineChart = await getChartData(userId, db);

    return {
      user: userData,
      links,
      subscribers,
      stats: {
        pieChart,
        lineChart,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

//=======================================================

const getPieChartData = async (userId, db) => {
  const week = await db
    .select("campaign_name")
    .count("*")
    .where("subscribed_to", userId)
    .where(db.raw("stats.date < now() "))
    .where(db.raw("stats.date > NOW() - INTERVAL '7 days' "))
    .groupBy("campaign_name")
    .from("stats");
  const month = await db
    .select("campaign_name")
    .count("*")
    .where("subscribed_to", userId)
    .where(db.raw("stats.date < now() "))
    .where(db.raw("stats.date > NOW() - INTERVAL '30 days' "))
    .groupBy("campaign_name")
    .from("stats");
  const year = await db
    .select("campaign_name")
    .count("*")
    .where("subscribed_to", userId)
    .where(
      db.raw("EXTRACT(YEAR FROM ??::date) = EXTRACT(YEAR FROM CURRENT_DATE)", [
        "date",
      ])
    )
    .groupBy("campaign_name")
    .from("stats");

  return { week, month, year };
};

//=======================================================

const getChartData = async (userId, db) => {
  const tempWeek = await db
    .select(db.raw("to_char(date, 'DD/MM/YYYY')"))
    .count("stats.date")
    .where("subscribed_to", userId)
    .where(db.raw("stats.date < now() "))
    .where(db.raw("stats.date > NOW() - INTERVAL '7 days' "))
    .groupBy(db.raw("to_char(date, 'DD/MM/YYYY')"))
    .from("stats");

  const weekDateList = generateDateList(7);
  const week = fillInData(weekDateList, tempWeek);

  const tempMonth = await db
    .select(db.raw("to_char(date, 'DD/MM/YYYY')"))
    .count("stats.date")
    .where("subscribed_to", userId)
    .where(db.raw("stats.date < now() "))
    .where(db.raw("stats.date > NOW() - INTERVAL '30 days' "))
    .groupBy(db.raw("to_char(date, 'DD/MM/YYYY')"))
    .from("stats");

  const monthDateList = generateDateList(30);
  const month = fillInData(monthDateList, tempMonth);

  const tempYear = await db
    .select(db.raw("EXTRACT(MONTH FROM date)"))
    .count("date")
    .where("subscribed_to", userId)

    .where(
      db.raw("EXTRACT(YEAR FROM ??::date) = EXTRACT(YEAR FROM CURRENT_DATE)", [
        "date",
      ])
    )
    .groupBy(db.raw("EXTRACT(MONTH FROM stats.date)"))

    .from("stats");

  const year = fillInYearData(tempYear);

  const chartData = { week, month, year };
  return chartData;
};

//=======================================================

const monthNames = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Augt",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

//=======================================================

const getUtcDate = (date) => {
  var month = date.getUTCMonth() + 1;
  var day = date.getUTCDate();
  var year = date.getUTCFullYear();
  let newDate =
    ("0" + day).slice(-2) + "/" + ("0" + month).slice(-2) + "/" + year;
  return newDate;
};

//=======================================================

const generateDateList = (length) => {
  let week = [];
  for (let i = 0; i < length; i++) {
    var date = new Date();
    date.setDate(date.getDate() - i);
    let utcDate = getUtcDate(date);
    week.push(utcDate);
  }
  return week.reverse();
};

//=======================================================

const fillInData = (dateList, currentData) => {
  debugger;
  let data = [];
  dateList.forEach((date) => {
    const index = currentData.findIndex((el) => el.to_char === date);

    var monthIndex;
    if (index > -1) {
      let temp = date.split("/");

      if (temp[1][0] === "0") {
        monthIndex = temp[1][1];
      } else {
        monthIndex = temp[1];
      }
      let newDate = temp[0] + "-" + monthNames[monthIndex];
      let item = {};
      item[newDate] = currentData[index]["count"];
      data.push(item);
    } else {
      let temp = date.split("/");
      if (temp[1][0] === "0") {
        monthIndex = temp[1][1];
      } else {
        monthIndex = temp[1];
      }
      let newDate = temp[0] + "-" + monthNames[monthIndex];
      let item = {};
      item[newDate] = "0";
      data.push(item);
    }
  });
  return data;
};

//=======================================================

const fillInYearData = (currentData) => {
  let data = [];
  for (let i = 1; i < 13; i++) {
    const index = currentData.findIndex((el) => el.date_part === i);
    if (index != -1) {
      let item = {};
      item[monthNames[i]] = currentData[index]["count"];
      data.push(item);
    } else {
      let item = {};
      item[monthNames[i]] = "0";
      data.push(item);
    }
  }
  return data;
};

module.exports = { getData: getData };
