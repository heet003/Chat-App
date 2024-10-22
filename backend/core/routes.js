module.exports = function (app) {
  require("../controller/user")(app, "/api/users");
  require("../controller/message")(app, "/api/messages");
  require("../controller/friendrequest")(app, "/api/friends");
};
