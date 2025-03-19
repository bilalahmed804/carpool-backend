import express from "express";
import mongoose from "./ConnectDB/dbConnection.js";
import cors from "cors";
import "dotenv/config";
import userRouter from "./Routes/UserRoutes.js";
import ridesRoutes from "./Routes/RidesRoutes.js";
import http from "http";
import { Server } from "socket.io";
import locationRoutes from "./Routes/LocationRoutes.js";
import { stringify } from "querystring";

const app = express();
const port = process.env.PORT || 4000; // use process.env.PORT for Vercel

// for mongo db connection
mongoose.connection.on("error", (err) => {
  console.log("Error in connection", err);
});
mongoose.connection.on("open", () => {
  console.log("MongoDB is connected successfully");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  methods: ["GET", "POST"],
});

let activeUsers = {};

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Register user
  socket.on("registerUser", ({ userID }) => {
    activeUsers[userID] = socket.id;
    console.log(`User Registered: ${userID} -> ${socket.id}`);
  });

  // User requests a ride
  socket.on("userRequestToDriver", (userData) => {
    console.log("User requested a ride:", userData);
    const driverSocketID = activeUsers[userData.driver_ID];
    if (!driverSocketID) {
      socket.emit("driverOffline", "Driver is offline");
      return;
    }
    socket.to(driverSocketID).emit("rideRequest", userData);
    console.log(`Ride Request sent to Driver: ${JSON.stringify(userData)}`); 
  });
  
  // Driver accepts request
  socket.on("DriverResponse_Accept", (data) => {
    console.log("Ride Accepted:", data);
    const userSocketID = activeUsers[data.requesteeID]
    console.log("userSocketID==>", userSocketID)
    socket.to(userSocketID).emit("requestAccepted", data)
  });
 
  // Driver rejects request (Fixed wrong io.on usage)
  socket.on("DriverResponse_Reject", (data) => {
    console.log("Ride Rejected:", data);
    const userSocketID = activeUsers[data.requesteeID]
    console.log("userSocketID==>", userSocketID)
    socket.to(userSocketID).emit("requestRejected", data)
});

socket.on("liveLocation",(location)=>{
  console.log("live location_driver ==> ",location); 
} )

  

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.id} due to ${reason}`);

    // Remove user from active users
    // const userID = Object.keys(activeUsers).find((key) => activeUsers[key] === socket.id);
    // if (userID) {
    //   delete activeUsers[userID];
    //   console.log(Removed ${userID} from active users.);
    // }

    // Additional disconnect reasons
    if (reason === "io server disconnect") {
      console.log("Server disconnected this client manually.");
      socket.connect();
    } else if (reason === "transport close") {
      console.log("Client closed the browser/tab or network issue.");
    } else if (reason === "ping timeout") {
      console.log("Client lost internet connection.");
    } else if (reason === "transport error") {
      console.log("Possible firewall or proxy issue.");
    }
  });
});


// main page message
app.get("/", (req, res) => {
  res.send("Welcome TO SHARING CAB");
});

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // This will allow us to handle JSON bodies

app.use("/user", userRouter);
app.use("/rides", ridesRoutes);
app.use("/location", locationRoutes);

server.listen(port, () => {
  console.log("server is running on port : ", port);
});