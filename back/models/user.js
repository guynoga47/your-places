const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
/* 
Uniqueness in Mongoose is not a validation parameter(like required),it tells Mongoose to create a unique index in MongoDB for that field.

The uniqueness constraint is handled entirely in the MongoDB server. When you add a document with a duplicate key, the MongoDB server will return the error that you are showing (E11000...).

You have to handle these errors yourself if you want to create custom error messages. The Mongoose documentation (search for "Error Handling Middleware") provides you with an example on how to create custom error handling:

schmea.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('email must be unique'));
  } else {
    next(error);
  }
});
or you can use this plugin mongoose-unique-validator

(although this doesn't provide you with the specific field for which the uniqueness constraint failed) */

const Schema = mongoose.Schema;

const userScehma = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
  //array of type Place: we are telling mongoose about the one to many relation from user to places.
});

userScehma.plugin(uniqueValidator);

module.exports = mongoose.model("User", userScehma);
