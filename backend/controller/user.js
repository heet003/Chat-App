var express = require("express");
var userRouter = express.Router();
var db = require("../lib/database");
var helper = require("../core/helper");
const fileUpload = require("../core/file-upload");
const mail = require("../core/mail");
const passport = require("passport");
const message = require("../lang/en/en");
const { max } = require("moment");

const ACCESSTOKEN = "AccessToken";
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

let user = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

user.getFriends = async (req, res) => {
  const { userId } = req.uSession;
  let foundUser;
  let promise = helper.paramValidate({ code: 2010, val: !userId });

  promise.then(async () => {
    return await db
      ._find(
        "users",
        {
          _id: userId,
        },
        { _id: 1, name: 1, bio: 1, image: 1, email: 1, friends: 1 }
      )
      .then((u) => {
        if (u.length < 0) {
          return Promise.reject(403);
        }
        foundUser = u[0];
        return foundUser;
      })
      .then(async (user) => {
        return await db._find("users", { _id: { $in: user.friends } });
      })
      .then((friends) => {
        helper.success(res, { friends: friends, userId });
      })
      .catch((e) => {
          helper.error(res, e);
      });
  });
};

user.searchUser = (req, res) => {
  const { userId } = req.uSession;
  const { query } = req.body;

  let promise = helper.paramValidate(
    { code: 2010, val: !userId },
    { code: 2010, val: !query }
  );

  promise.then(async () => {
    return await db
      ._find(
        "users",
        {
          $or: [
            { email: { $regex: query, $options: "i" } },
            { name: { $regex: query, $options: "i" } },
          ],
        },
        {
          _id: 1,
          email: 1,
          name: 1,
          image: 1,
        }
      )
      .then((u) => {
        if (u.length < 0) {
          return Promise.reject(403);
        }
        return u;
      })
      .then((user) => {
        helper.success(res, { users: user });
      })
      .catch((e) => {
        helper.error(res, e);
      });
  });
};

user.googleAuth = function (req, res) {
  const { token } = req.body;

  let promise = helper.paramValidate({ code: 2010, val: !token });
  let foundUser = {};
  let userId;
  let payload;

  promise
    .then(async () => {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
      });
      return ticket;
    })
    .then(async (t) => {
      payload = t.getPayload();
      const user = await db._findOne("users", { googleId: payload.sub });
      if (user.length == 0) {
        foundUser = {
          googleId: payload.sub,
          name: payload.name,
          email: payload.email,
          image: payload.picture,
          role: "user",
          friends: [],
          bio: "",
          createdAt: new Date(),
        };
        const id = await db.insert("users", foundUser);
        foundUser._id = id;
        return foundUser._id;
      } else {
        foundUser = user[0];
        return foundUser._id;
      }
    })
    .then((id) => {
      userId = id;
      const token = {
        userId: id,
        ttl: helper.token.TTL(),
        created: helper.dbDate(),
      };
      return db.insert(ACCESSTOKEN, token);
    })
    .then((tokenId) => {
      const tokenInfo = {
        userId,
        tokenId,
      };
      const token = helper.token.get(tokenInfo);
      foundUser.token = token;
    })
    .then(() => helper.success(res, foundUser))
    .catch((e) => {
      helper.error(res, e);
    });
};

user.login = function (req, res) {
  const { email, password } = req.body;

  let promise = helper.paramValidate(
    { code: 2010, val: !email },
    { code: 2010, val: !helper.isValidEmail(email) },
    { code: 2011, val: !password }
  );
  let foundUser = {};

  promise
    .then(() => {
      //find foundUser
      return db._findOne("users", {
        email: email,
      });
    })
    .then((u) => {
      //check foundUser is exist or not
      if (u.length > 0) {
        foundUser = u[0];
        return foundUser;
      }
      return Promise.reject(2003);
    })
    .then((u) => {
      //check for password correctness
      if (helper.md5(password) != u.password) {
        return Promise.reject(2006);
      }
      return u;
    })
    .then((u) => {
      //insert token token
      let token = {
        userId: u._id,
        ttl: helper.token.TTL(),
        created: helper.dbDate(),
      };
      return db.insert(ACCESSTOKEN, token);
    })
    .then((tokenId) => {
      //create token
      let tokenInfo = {
        userId: foundUser._id,
        tokenId: tokenId,
      };
      token = helper.token.get(tokenInfo);
      user.token = token;
    })
    .then(() => helper.success(res, user))
    .catch((e) => {
      helper.error(res, e);
    });
};

user.signup = async (req, res) => {
  const { name, email, password, image } = req.body;

  let promise = helper.paramValidate(
    { code: 2010, val: !name },
    { code: 2010, val: !email },
    { code: 2010, val: !helper.isValidEmail(email) },
    { code: 2011, val: !password }
  );
  const newUser = {
    name,
    role: "user",
    bio: "",
    email,
    password: helper.md5(password),
    image,
    friends: [],
    createdAt: new Date(),
  };
  let userId;

  promise
    .then(async () => {
      return await db._findOne("users", { email });
    })
    .then(async (user) => {
      if (!user[0]) {
        return await db.insert("users", newUser);
      }
      return Promise.reject(2010);
    })
    .then((uid) => {
      userId = uid;
      let token = {
        userId: uid,
        ttl: helper.token.TTL(),
        created: helper.dbDate(),
      };
      return db.insert(ACCESSTOKEN, token);
    })
    .then((tokenId) => {
      let tokenInfo = {
        userId: userId,
        tokenId: tokenId,
      };
      token = helper.token.get(tokenInfo);
      user.token = token;
    })
    .then(() => helper.success(res, user))
    .catch((e) => {
      helper.error(res, e);
    });
};

user.userProfile = (req, res) => {
  const { userId } = req.uSession;

  let promise = helper.paramValidate({ code: 2010, val: !userId });

  promise
    .then(async () => {
      return await db._findOne(
        "users",
        { _id: userId },
        { name: 1, role: 1, email: 1, image: 1, bio: 1 }
      );
    })
    .then((u) => {
      if (u.length > 0) {
        return u[0];
      }
      return Promise.reject(1003);
    })
    .then((user) => {
      helper.success(res, { user });
    })
    .catch((err) => {
      helper.error(res, err);
    });
};

user.sendOtp = (req, res) => {
  const { email } = req.body;

  let promise = helper.paramValidate({ code: 2010, val: !email });

  const otp = generateOTP();
  const subject = "Email Verification - Open Mic";
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            width: 200px;
            height: auto;
        }
        .content {
            text-align: left;
        }
        .otp {
            text-align: center;
            font-size: 24px;
            margin: 20px 0;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 4px;
            border: 1px solid #ccc;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <!-- Embedding the logo image using CID -->
            <img src="cid:logo" alt="Open Mic Logo" width="100">
        </div>
        <div class="content">
            <p>Dear User,</p>
            <p>Thank you for registering with Open Mic.</p>
            <p>Your verification code is:</p>
            <div class="otp">${otp}</div>
            <p>Please enter this code to verify your email address and complete your registration.</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
            <p>&copy; 2024 Open Mic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

  promise
    .then(async () => {
      return await db._findOne("users", { email });
    })
    .then((u) => {
      if (u.length > 0) {
        return u[0];
      }
      throw new Error("User Doesn't Exist.");
    })
    .then(async (user) => {
      if (user) {
        return await mail.sendMail(email, subject, body, true);
      }
    })
    .then(async (result) => {
      if (result) {
        const otpDocument = {
          email,
          otp,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        };

        return await db.insert("otps", otpDocument);
      }
      return Promise.reject(403);
    })
    .then((id) => {
      if (id) {
        helper.success(res, {
          otp,
        });
      }
    })
    .catch((error) => {
      helper.error(res, error);
    });
};

user.resetPassword = (req, res) => {
  const { email, otp, newPassword } = req.body;

  let promise = helper.paramValidate(
    { code: 2010, val: !email },
    { code: 2010, val: !otp },
    { code: 2010, val: !newPassword }
  );
  var foundUser;
  var otpDocument;
  promise
    .then(async () => {
      return await db._findOne("otps", { email, otp });
    })
    .then((otp) => {
      if (otp.length > 0) {
        otpDocument = otp[0];
      } else {
        return new Error("Otp is invalid.");
      }
    })
    .then(async () => {
      const currentTime = new Date();
      if (currentTime > new Date(otpDocument.expiresAt)) {
        throw new Error("OTP has expired.");
      }
      await db.delete("otps", { email });
    })
    .then(() => {
      db.update("users", { email }, { password: helper.md5(newPassword) });
    })
    .then((user) => {
      helper.success(res, { message: "OTP verified successfully." });
    })
    .catch((error) => {
      helper.error(res, error);
    });
};

user.updateProfile = (req, res) => {
  const { userId } = req.uSession;
  const { role, name, bio, image } = req.body;

  let promise = helper.paramValidate({ code: 2010, val: !userId });

  promise
    .then(async () => {
      return await db._findOne("users", { _id: userId });
    })
    .then((u) => {
      if (u.length > 0) {
        return u[0];
      }
      return Promise.reject(1003);
    })
    .then(async (user) => {
      const updatedData = {
        role,
        name,
        bio,
      };
      if (image) {
        updatedData.image = image;
      }

      return await db.update("users", { _id: userId }, updatedData);
    })
    .then((user) => {
      helper.success(res, { user });
    })
    .catch((error) => {
      helper.error(res, error);
    });
};

module.exports = function (app, uri) {
  userRouter.get("/friends", user.getFriends);
  userRouter.post("/login", user.login);
  userRouter.post("/auth/google/callback", user.googleAuth);
  userRouter.post("/signup", user.signup);
  userRouter.post("/search-user", user.searchUser);
  userRouter.get("/profile", user.userProfile);
  userRouter.post("/profile", user.updateProfile);
  userRouter.post("/send-otp", user.sendOtp);
  userRouter.post("/reset-password", user.resetPassword);

  app.use(uri, userRouter);
};
