require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const uploadRouter = require("./controller/uploadImage");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const OAuth2Strategy = require("passport-google-oauth20").Strategy;
const ACCESSTOKEN = "AccessToken";
const helper = require("./core/helper");
var db = require("./lib/database");
const { log } = require("console");

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("addToOnline", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });

  socket.on("addNewUser", (chatId) => {
    socket.join(chatId);
  });

  socket.on("typing", (data) => {
    console.log(data);
    io.to(data.room).emit("typing", data);
  });

  socket.on("stopTyping", (data) => {
    console.log(data);
    io.to(data.room).emit("stopTyping", data);
  });

  socket.on("sendMessage", (data) => {
    const { chatId, newMessage } = data;
    const message = {
      senderId: socket.userId,
      message: newMessage,
      timestamp: new Date(),
    };

    io.to(newMessage.senderId).emit("message", message);
  });

  socket.on("disconnect", () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });
});

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(
  session({
    secret: "MY_SECRET_2024_SESSION_KEY",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new OAuth2Strategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      res.redirect("http://localhost:3000/chats");
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/",
    failureRedirect: "http://localhost:3000/auth",
  })
);

app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.get("/", (req, res) => res.send("YOU ARE AT SDS API SERVER [V1]"));

require("./core")(app);

const PORT = process.env.SERVER_PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});

module.exports = app;
