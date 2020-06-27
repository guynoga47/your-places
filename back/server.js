const express = require("express");
const fs = require("fs");
const path = require("path");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());
/* parse any incoming request body, and extract any
json data in there, convert it to regular js data structure like objects/arrays
and then call next automatically, adding the json data in there. it's important
that we use this middleware before we actually need the bodyParser (in the post
middleware, in places-routes for example) */

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  /* which domains should have access. * means all. this enforcers only the browser 
  (for example postman doesnt care about it) */
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  /* controls which headers incoming requests may have so that they are handled */
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  /* controls which http methods will be used on the front-end, or attached to incoming
  requests. */
  next();
});

/* we defined a middleware such that we append those headers to every response that we
send from the server to the front end, this is the second middleware we apply. */

app.use(
  "/api/places",
  placesRoutes
); /* adding the router from placesRoutes as middleware */

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
}); //this middleware will be reached only if we have some request which
//didn't get a response before, and that can only be a request which we dont want
//to handle.

app.use((error, req, res, next) => {
  /* custom middleware we build to handle errors. every middleware is of type:
(req, res, next) => {...} 
if we pass 4 arguments express will recongize it as a special error handling,
middleware function: this will only be executed on requests that has an error
thrown in the waend */
  if (req.file) {
    /*
    this part intended to rollback every file save which is part
    of a failed fileupload request.
    file is added to request because it's funneled through the multer
    middleware before it's reaches here, on fileupload requests.
    */
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.heanderSent) {
    /*meaning we already sent a response to handle the error, and u can only
    send one response, then we just forward the error*/
    return next(error);
  } else {
    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error occurred!" });
  }
});

mongoose
  .connect(
    `mongodb+srv://guynoga47:245891Aa@cluster0-frgyt.mongodb.net/your-places?retryWrites=true&w=majority`
  )
  .then(() => app.listen(5000))
  .catch((error) => console.log(error));
/* 

generic middleware:
app.use()

middleware for specific functions:
app.get / app.post / app.patch etc...

*/
