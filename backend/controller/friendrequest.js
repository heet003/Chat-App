var express = require("express");
var friendRouter = express.Router();
var db = require("../lib/database");
var helper = require("../core/helper");
const message = require("../lang/en/en");
const { database } = require("firebase-admin");

let frnd = {};

frnd.sendRequest = (req, res) => {
  const { userId } = req.uSession;
  const { friendId } = req.body;
  var foundFriend;
  var foundUser;
  let promise = helper.paramValidate(
    { code: 2011, val: !userId },
    { code: 2011, val: !friendId }
  );

  promise
    .then(async () => {
      if (userId === friendId) {
        return Promise.reject(403);
      }
      return await db._findOne("users", { _id: friendId });
    })
    .then(async (friend) => {
      if (friend.length < 0) {
        return Promise.reject(1001);
      }
      foundFriend = friend[0];
      return await db._findOne("users", { _id: userId });
    })
    .then(async (user) => {
      if (user.length < 0) {
        return Promise.reject(1001);
      }
      foundUser = user[0];
      if (foundUser.friends.includes(friendId)) {
        return Promise.reject(2010);
      }
      return await db._findOne("friendRequests", {
        fromUserId: userId,
        friendId: friendId,
      });
    })
    .then((requests) => {
      if (requests.length > 0) {
        return Promise.reject(2010);
      }
    })
    .then(async () => {
      return await db.insert("friendRequests", {
        fromUserId: userId,
        fromName: foundUser.name,
        toUserId: friendId,
        toName: foundFriend.name,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    })
    .then((fId) => {
      if (fId) {
        helper.success(res, { success: "Friend request Sent!" });
      }
    })
    .catch((e) => {
      helper.error(res, e);
    });
};

frnd.getSentRequests = (req, res) => {
  const { userId } = req.uSession;

  let promise = helper.paramValidate({ code: 2011, val: !userId });

  promise
    .then(async () => {
      return await db.find("friendRequests", {
        fromUserId: userId,
      });
    })
    .then((requests) => {
      if (requests.length < 0) {
        return Promise.reject(403);
      }
      return requests;
    })
    .then((r) => {
      helper.success(res, { requests: r });
    })
    .catch((e) => {
      helper.error(res, e);
    });
};

frnd.getReceivedRequests = (req, res) => {
  const { userId } = req.uSession;

  let promise = helper.paramValidate({ code: 2011, val: !userId });

  promise
    .then(async () => {
      return await db.find("friendRequests", {
        toUserId: userId,
      });
    })
    .then((requests) => {
      if (requests.length < 0) {
        return Promise.reject(403);
      }
      return requests;
    })
    .then((r) => {
      helper.success(res, { requests: r });
    })
    .catch((e) => {
      helper.error(res, e);
    });
};

frnd.requestAction = (req, res) => {
  const { userId } = req.uSession;
  const { action } = req.body;
  const { requestId } = req.params;

  let promise = helper.paramValidate(
    { code: 2011, val: !userId },
    { code: 2011, val: !requestId },
    { code: 2011, val: !action }
  );
  let friendRequest;
  promise
    .then(async () => {
      return await db.find("friendRequests", {
        _id: requestId,
      });
    })
    .then((requests) => {
      if (requests.length === 0) {
        // Change this from < 0 to === 0
        return Promise.reject(403);
      }
      friendRequest = requests[0];
    })
    .then(async () => {
      if (action == "rejected") {
        return await db.delete("friendRequests", { _id: requestId });
      } else {
        await db.insert("chats", {
          participants: [friendRequest.fromUserId, friendRequest.toUserId],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSeen: [
            { _id: friendRequest.fromUserId, date: new Date() },
            { _id: friendRequest.toUserId, date: new Date() },
          ],
        });
        await db.update(
          "friendRequests",
          { _id: requestId },
          { status: action }
        );
        await db.update(
          "users",
          { _id: friendRequest.fromUserId },
          { $addToSet: { friends: friendRequest.toUserId } }
        );
        await db.update(
          "users",
          { _id: friendRequest.toUserId },
          { $addToSet: { friends: friendRequest.fromUserId } }
        );
        return await db.delete("friendRequests", { _id: requestId });
      }
    })
    .then((d) => {
      helper.success(res, { success: "Success" });
    })
    .catch((e) => {
      helper.error(res, e);
    });
};

module.exports = function (app, uri) {
  friendRouter.post("/sent", frnd.sendRequest);
  friendRouter.get("/get-sent", frnd.getSentRequests);
  friendRouter.get("/get-received", frnd.getReceivedRequests);
  friendRouter.post("/action/:requestId", frnd.requestAction);
  //for crud
  app.use(uri, friendRouter);
};
