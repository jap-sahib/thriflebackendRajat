const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("Database is connected".green.inverse.bold);
  } catch (error) {
    console.error('Hii', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


