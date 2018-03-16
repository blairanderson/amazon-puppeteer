// You can either "yarn add aws-sdk" or "npm i aws-sdk"
const AWS = require('aws-sdk');

// Configure AWS with your access and secret key. I stored mine as an ENV on the server
// ie: process.env.ACCESS_KEY_ID = "abcdefg"
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

function sendScreenshot(asin, callback) {
  fs.readFile(`./tmp/${asin}.png`, function(err, data) {
    if (err) {
      throw err;
    }

    // Getting the file type, ie: jpeg, png or gif
    const type = 'png';

    const base64data = new Buffer(data, 'binary');

    const s3 = new AWS.S3();

    // With this setup, each time your user uploads an image, will be overwritten.
    // To prevent this, use a unique Key each time.
    // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: asin, // type is not required
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64', // required
      ContentType: `image/${type}` // required. Notice the back ticks
    };

    // The upload() is used instead of putObject() as we'd need the location url and assign that to our user profile/database
    // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    s3.upload(params, function(err, data) {
      if (err) {
        return console.log(err);
      }
      // Continue if no error
      // Save data.Location in your database
      console.log('Image successfully uploaded.');
    });
  });
}
