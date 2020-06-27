const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const fs = require("fs");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceByPlaceId = async (req, res, next) => {
  let place;
  try {
    place = await Place.findById(req.params.pid);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find a place", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
    //res.status default is 200.
    /* version 2: 
  
      const error = new Error("Could not find a place for the provided id.");
      error.code = 404;
      throw error; */

    /* version 1:
  
      res
        .status(404)
        .json({ message: "Could not find a place for the provided id." });*/
  } else {
    res.json({ place: place.toObject({ getters: true }) }); // {place} => {place:place}
  }
};

const getPlacesByUserId = async (req, res, next) => {
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(req.params.uid).populate("places");
  } catch (error) {
    return next(
      new HttpError("Fetching places failed, please try again later", 500)
    );
  }

  if (!userWithPlaces) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    ); /*same as throw, just using forward to next middleware */
  } else {
    res.json({
      places: userWithPlaces.places.map((place) =>
        place.toObject({ getters: true })
      ),
    });
  }
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
    //we must use next when working with asyncronous code
  }
  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
    //we throw and error in getCoordsForAddress, so we must call it in a try
    //catch block. and then we want to quit and forward the error
    //to the next middleware.
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates, //coordinates that we got from google, using the address in request body
    address,
    creator,
    image: req.file.path,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(
      new HttpError("Creating place failed, please try again later."),
      500
    );
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id", 404));
  }
  try {
    //part 1
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    //part 2
    user.places.push(createdPlace);
    await user.save({ session: session });
    /* not the standard push for array, a mongoose function.
    behind the scenes mongoose grabs the place id only and pushes it to the
    places array in the user. */
    await session.commitTransaction();
    /* only at this point the changes are really saved in the database.
        if anything went wrong up untill this point mongodb would rollback
        all the changes.
    */
    /* with transactions, if the collection isn't set beforehand then the above code
      would not cause the creation of a new collection, hence we need to make sure it's
      setted before the first transaction attemp.
    */
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Creating place failed, please try again later.", 500)
    );
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description } = req.body;

  let place;

  try {
    place = await Place.findById(req.params.pid);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  let place;
  try {
    place = await Place.findById(req.params.pid).populate("creator");
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete place"),
      500
    );
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id", 404));
  }

  const imagePath = place.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong, could not delete place"),
      500
    );
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({ message: "Deleted Place." });
};

exports.getPlaceByPlaceId = getPlaceByPlaceId;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
