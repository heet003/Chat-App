var express = require("express");
var messageRouter = express.Router();
var db = require("../lib/database");
const { ObjectId } = require("mongodb");
var helper = require("../core/helper");
const message = require("../lang/en/en");
const multer = require("multer");

const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const config = require("../core/firebase");

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

let msg = {};

msg.sendMessage = (req, res) => {
  const { userId } = req.uSession;
  const { newMessage, fileName, fileUrl } = req.body;
  const { friendId } = req.params;

  let promise = helper.paramValidate(
    { code: 2011, val: !userId },
    { code: 2011, val: !friendId }
  );

  const messageObj = {
    _id: new ObjectId().toString(),
    senderId: userId,
    message: newMessage,
    fileName,
    fileUrl,
    timestamp: new Date(),
    status: "sent",
  };

  promise
    .then(async () => {
      return await db._findOne("chats", {
        participants: {
          $all: [userId, friendId],
        },
      });
    })
    .then((chats) => {
      if (chats.length < 0) {
        return Promise.reject(403);
      }
      return chats[0];
    })
    .then(async (chat) => {
      return await db.update(
        "chats",
        { _id: chat._id, "lastSeen._id": userId }, 
        {
          $push: { messages: messageObj }, 
          $set: {
            "lastSeen.$.date": new Date(),
            updatedAt: new Date(),
          }, 
        }
      );
    })
    .then(async () => {
      return await db._findOne("chats", {
        participants: {
          $all: [userId, friendId],
        },
      });
    })
    .then((data) => helper.success(res, { messages: data[0].messages }))
    .catch((e) => {
      helper.error(res, e);
    });
};

msg.editMessage = (req, res) => {
  const { userId } = req.uSession;
  const { friendId } = req.params;
  const { editedText, messageId } = req.body;

  let promise = helper.paramValidate(
    { code: 2011, val: !userId },
    { code: 2011, val: !friendId },
    { code: 2011, val: !messageId },
    { code: 2011, val: !editedText }
  );

  var chatObject;

  promise
    .then(async () => {
      return await db._findOne("chats", {
        participants: {
          $all: [userId, friendId],
        },
      });
    })
    .then((chats) => {
      if (chats.length < 0) {
        return Promise.reject(403);
      }
      chatObject = chats[0];
    })
    .then(async () => {
      await db.update(
        "chats",
        {
          _id: chatObject._id,
          "messages._id": messageId,
        },
        {
          "messages.$.message": editedText,
          "messages.$.status": "edited",
        }
      );
    })
    .then(() => {
      helper.success(res, { message: "Success" });
    })
    .catch((e) => {
      helper.error(res, e);
    });
};

msg.getMessages = (req, res) => {
  const { userId } = req.uSession;
  const { friendId } = req.params;

  let promise = helper.paramValidate(
    { code: 2011, val: !userId },
    { code: 2011, val: !friendId }
  );

  promise
    .then(async () => {
      return await db._findOne("chats", {
        participants: {
          $all: [userId, friendId],
        },
      });
    })
    .then((chats) => {
      if (chats.length < 0) {
        return Promise.reject(403);
      }
      return chats[0];
    })
    .then((chat) => {
      helper.success(res, { chat });
    })
    .catch((e) => {
      helper.error(res, e);
    });
};

messageRouter.post(
  "/upload/:friendId",
  upload.single("filename"),
  async (req, res) => {
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

      const newMessage = {
        _id: new ObjectId().toString(),
        senderId: userId,
        fileName: req.file.originalname,
        fileUrl: downloadURL,
        timestamp: new Date(),
        status: "sent",
      };

      const chats = await db._findOne("chats", {
        participants: {
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
        name: req.file.originalname,
        downloadURL,
        senderId: userId,
        type: req.file.mimetype,
        downloadURL: downloadURL,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

module.exports = function (app, uri) {
  messageRouter.post("/send-message/:friendId", msg.sendMessage);
  messageRouter.get("/:friendId", msg.getMessages);
  messageRouter.post("/edit/:friendId", msg.editMessage);
  app.use(uri, messageRouter);
};
