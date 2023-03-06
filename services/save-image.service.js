const AWS = require("aws-sdk");
require("dotenv").config();
const jimp = require("jimp");
const {v4: uuid} = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const saveImageToS3Bucket = async (imagesArray) => {
  let images = [];
  for (let index = 0; index < imagesArray.length; index++) {
    try {
      let image = await jimp.read(imagesArray[index].imageUrl);
      let ratio = image.getWidth()/image.getHeight();
      console.log('ratio is', ratio);
      let ratioImage = image.resize(720, 720/ratio);
      await ratioImage.getBuffer(ratioImage.getMIME(), async (err, data) => {
        const uploadedImage = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET,
          Key: uuid(),
          ContentType: ratioImage.getMIME(),
          ACL: 'public-read',
          Body: data,
        })
        .promise();

      

      images.push({ imageUrl: uploadedImage.Location });
      })

    } catch (error) {
      console.log("S3 Upload Image Error: " + error.message);
    }
  }
  return images;
};


module.exports = { saveImageToS3Bucket };
