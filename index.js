import express from "express";
import mongoose from "./ConnectDB/dbConnection.js";
import cors from "cors";
import "dotenv/config";
import userRouter from "./Routes/UserRoutes.js";
import ridesRoutes from "./Routes/RidesRoutes.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
// const port = 4000;
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
});


io.on("connection", (socket) => {
  console.log("A user Connected==> ", socket?.id)
  //send msg to channel name "data"
  socket.on("data", (data)=>{
    console.log("Ather ki taraf se aaya wa data ==> ", data)
  });
  //recieve something on channel name "message"
  socket.emit("message" , "hello to client")
});

// main page message
app.get("/", (req, res) => {
  res.send("Welcome TO SHARING CAB");
});

app.use(cors()); // Enable CORS for all routes  
app.use(express.json()); // This will allow us to handle JSON bodies

app.use("/user", userRouter);
app.use("/rides", ridesRoutes);

server.listen(port, () => {
  console.log("server is running on port : ", port);
});
