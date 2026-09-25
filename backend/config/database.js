const mongoose = require('mongoose');

const dbConnect = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trading';
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
};

module.exports = { dbConnect };
