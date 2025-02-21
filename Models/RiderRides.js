import mongoose from "mongoose";
const { Schema } = mongoose;

const RidesSchema = new Schema(
  {
    userID: { type: String, required: true },
    availableSeats: { type: String },
    farePerSeat : {type : String},
    routes : [{"ltd": Number, "long": Number}],
  },
  { timestamps: true }
);

const RidesModel =
  mongoose.models.Rides || mongoose.model("Rides", RidesSchema);

export default RidesModel;
