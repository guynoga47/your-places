/* here we will regsiter middlewares which is responsible 
for handling routes related to places. */
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controllers");
const fileUpload = require("../middleware/file-upload");

/* give us a special object which we can export in the end, with all of its
configuration that we will define here, to app.js and we will register it 
there as a middleware */

router.get("/:pid", placesControllers.getPlaceByPlaceId);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

router.post(
  "/",
  fileUpload.single("image"),
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").not().isEmpty(),
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  placesControllers.updatePlace
);

router.delete("/:pid", placesControllers.deletePlace);

/*export syntax in node js */
module.exports = router;
