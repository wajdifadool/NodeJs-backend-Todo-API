const colors = require('colors');
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(colors.green(`🍃 MongoDB connected:  ${conn.connection.host} 🍃 `.bold));
};

module.exports = connectDB;
