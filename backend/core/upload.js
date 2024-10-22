let uploadOn = "s3";

let image = function (fileName, path, file, isBase64 = 0) {
  if (uploadOn == "s3") {
    return imageS3(fileName, path, file, isBase64);
  }

  return Promise.resolve();
};

let imageS3 = function (fileName, path, file, isBase64 = 0) {
  var base64data = file;
  if (!isBase64) {
    base64data = new Buffer(file.data, "binary");
  } else {
    base64data = new Buffer(base64data, "base64");
  }

  return Promise.resolve().then(function () {
    return new Promise(function (resolve, reject) {
      var AWS = require("aws-sdk");
      AWS.config.update({ accessKeyId: "", secretAccessKey: "" });
      var s3 = new AWS.S3();

      s3.putObject(
        {
          Bucket: "",
          Key: fileName,
          Body: base64data,
          ACL: "public-read",
        },
        function (resp) {
          
          resolve();
        }
      );
    });
  });
};

const upload = {
  image,
};

module.exports = upload;
