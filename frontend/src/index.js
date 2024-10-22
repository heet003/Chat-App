import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// const messageSchema = new mongoose.Schema(
//   {
//     sender: {
//       type: mongoose.Types.ObjectId,
//       ref: "User",
//     },
//     message: {
//       type: String,
//       trim: true,
//     },
//     chat: {
//       type: mongoose.Types.ObjectId,
//       ref: "Chat",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const chatSchema = new mongoose.Schema(
//   {
//     chatName: {
//       type: String,
//       trim: true,
//     },
//     isGroupChat: {
//       type: Boolean,
//       default: false,
//     },
//     users: [
//       {
//         type: mongoose.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     latestMessage: {
//       type: mongoose.Types.ObjectId,
//       ref: "Message",
//     },
//     groupAdmin: {
//       type: mongoose.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Please Provide a Username"],
//     trim: true,
//     minlength: 4,
//   },
//   email: {
//     type: String,
//     required: [true, "Please provide an email"],
//     unique: true,
//     trim: true,
//     validate: {
//       validator: validator.isEmail,
//       message: "Please Provide Email",
//     },
//   },
//   password: {
//     type: String,
//     required: [true, "Please Provide Password"],
//     minlength: 8,
//     trim: true,
//   },
// });
