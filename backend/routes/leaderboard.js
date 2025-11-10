const express = require('express');
const app = express();
app.use(express.json());

app.get('/', async (req, res) => {
  try {
    const Log = require('../models/Log');
    const { User } = require('../models/User');

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const leaderboardData = await Log.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo, $lte: today },
          amount: { $type: "number" },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalEmissions: { $sum: "$amount" },
        },
      },
      {
        $addFields: {
          avgEmissions: { $divide: ["$totalEmissions", 30] },
        },
      },
      {
        $match: { avgEmissions: { $gt: 0.01 } },
      },
      { $sort: { avgEmissions: 1 } },
    ]);

    const userIds = leaderboardData.map(e => e._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select("firstName lastName")
      .lean();

    const result = leaderboardData.map((entry, i) => {
      const user = users.find(u => u._id.toString() === entry._id.toString());
      return {
        rank: i + 1,
        username: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
        avgEmissions: entry.avgEmissions ? Number(entry.avgEmissions.toFixed(2)) : 0,
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Leaderboard error:", err);
    return res.status(500).json({ error: "Failed to fetch leaderboard: " + err.message });
  }
});

module.exports = app;
