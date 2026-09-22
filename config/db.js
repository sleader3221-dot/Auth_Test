const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const mongoUri =
      process.env.MONGODB_URL ||
      "mongodb://Devendra:N83mKnzsmBhd7odS@ac-sn7l2l1-shard-00-00.0uilswm.mongodb.net:27017,ac-sn7l2l1-shard-00-01.0uilswm.mongodb.net:27017,ac-sn7l2l1-shard-00-02.0uilswm.mongodb.net:27017/DukanSE-Auth-Testing?ssl=true&replicaSet=atlas-l34j9f-shard-0&authSource=admin&appName=Cluster0";
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("☑️  MongoDB Database Connected Successfully");
  } catch (error) {
    console.error("❌  MongoDB Database Connection Failed:", error.message);
  }
};

module.exports = connectDB;
