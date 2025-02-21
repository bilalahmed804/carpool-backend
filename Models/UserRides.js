import mongoose from "mongoose";
const { Schema } = mongoose;

const UserRideSchema = new Schema(
  {
    userID: { type: String, required: true },
    from : {"ltd": Number, "long" : Number},
    to : {"ltd": Number, "long" : Number},
  },
  { timestamps: true }
);

const RidesModel =
  mongoose.models.Rides || mongoose.model("Rides", UserRideSchema);

export default RidesModel;
