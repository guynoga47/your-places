const multer = require("multer");
const { v1: uuidv1 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
}; //MIME TYPE is on the left

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "uploads/images");
    },
    filename: (req, file, callback) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      callback(null, uuidv1() + "." + ext);
    },
  }),
  fileFilter: (req, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = !isValid ? new Error("Invalid MIME type!") : null;
    callback(error, isValid);
  },
});

module.exports = fileUpload;
