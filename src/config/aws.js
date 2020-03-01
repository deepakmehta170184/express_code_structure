import AWS from "aws-sdk";

// AWS config
AWS.config.update({
	accessKeyId: process.env.aws_access_key_id,
	secretAccessKey: process.env.aws_secret_access_key
});

export const s3 = new AWS.S3();