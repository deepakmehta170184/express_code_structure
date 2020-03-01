import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/aws";

// image filter
const imageFilter = (req, file, cb) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		// accept image only
		cb("Error: unsupported files request!");
	}
	if (file.size > 20000000) {
		// 20MB check
		cb("Error: 20MB max files size supported!");
	}
	cb(null, true);
};

// image upload
export const imageUpload = multer({
	storage: multerS3({
		s3,
		bucket: process.env.aws_s3_bucket,
		key(req, file, cb) {
			cb(null, `${Date.now()}_${file.originalname}`);
		}
	}),
	imageFilter
});
