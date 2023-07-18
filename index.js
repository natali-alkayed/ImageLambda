'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context) => {

//This line exports a function named `handler` that will 
//be the entry point for our Lambda function. It takes in 
//an `event` object representing the trigger event and a 
//`context` object providing information about the execution environment.

  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const size = event.Records[0].s3.object.size;

//These lines extract information about the uploaded image from the
//`event` object. It retrieves the bucket name, the object key (i.e., the file path),
// and the size of the uploaded image.

  let imagesData;
  try {
    const response = await s3.getObject({ Bucket: bucket, Key: 'images.json' }).promise();
    imagesData = JSON.parse(response.Body.toString());
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      imagesData = [];
    } else {
      throw error;
    }
  }

//These lines retrieve the contents of the `images.json` file from
//the S3 bucket, if it exists. It uses the `s3.getObject` method to fetch
//the file and then parses the response body into a JavaScript object.

  let imageExists = false;
  for (const image of imagesData) {
    if (image.name === key) {
      image.size = size;
      imageExists = true;
      break;
    }
  }

//These lines iterate through the `imagesData` array to check if the uploaded image already 
//exists based on its name.
// If a matching image is found, it updates the size and sets `imageExists` to true.

  if (!imageExists) {
    const imageData = {
      name: key,
      size: size,
      // Add more metadata fields as needed (e.g., type)
    };
    imagesData.push(imageData);
  }

//This block of code executes if the uploaded image is not a duplicate. 
//It creates a new object `imageData` with the image's name and size, and any 
//additional metadata fields can be added. It then adds the `imageData` object to the `imagesData` array.

  await s3
    .putObject({
      Bucket: bucket,
      Key: 'images.json',
      Body: JSON.stringify(imagesData),
      ContentType: 'application/json',
    })
    .promise();

//This code uploads the updated `imagesData` array back to
// the S3 bucket, overwriting the existing `images.json` file. 
//It uses the `s3.putObject` method to store the JSON representation of `imagesData` in the bucket.

  return {
    statusCode: 200,
    body: JSON.stringify('Image processed successfully.'),
  };
};

//Finally, this line returns a response from the Lambda function, 
//indicating that the image was processed successfully. 
//The response contains a status code of 200 and a message indicating success.
