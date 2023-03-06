const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logoSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref:"users",
  },
  image: {
    type: String,
    required: true,
  },
  isEnabled: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = WebLogo = mongoose.model("logo", logoSchema);
