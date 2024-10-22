const express = require("express");
const { initializeApp } = require("firebase/app");
var db = require("../lib/database");
var helper = require("../core/helper");

const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const multer = require("multer");
const config = require("../core/firebase");
const message = require("./message");

const uploadRouter = express.Router();

initializeApp(config.firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return `${date}_${time}`;
};

uploadRouter.post("/", upload.single("filename"), async (req, res) => {
  const { userId } = req.uSession;
  const { friendId } = req.params;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const dateTime = giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `files/${req.file.originalname}_${dateTime}`
    );

    const metadata = {
      contentType: req.file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );

    const downloadURL = await getDownloadURL(snapshot.ref);

    const newMessage = new Message({
      senderId: userId,
      fileName: req.file.originalname,
      fileUrl: downloadURL,
      timestamp: new Date(),
      status: "sent",
    });

    const chats = await db._findOne("chats", {
      particpants: {
        $all: [userId, friendId],
      },
    });

    if (chats.length < 0) {
      return res.status(403).json({ message: "No chat found!" });
    }
    let chat = chats[0];

    await db.update(
      "chats",
      { _id: chat._id },
      {
        $push: { messages: newMessage },
        $set: { updatedAt: new Date() },
      }
    );

    return res.json({
      message: "File uploaded to Firebase storage",
      name: req.file.originalname,
      type: req.file.mimetype,
      downloadURL: downloadURL,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = uploadRouter;
