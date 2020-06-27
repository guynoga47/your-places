const axios = require("axios");
const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyByxzueWWvt7LpG3a-JdodQ_7fAaCI6FdY";

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  //await is the same as axios.get.then(...)
  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    //user entered valid address (non empty field) but Google can't find it.
    throw new HttpError(
      "Could not find location for the specified address.",
      422
    );
  }
  const coordinates = data.results[0].geometry.location; //lat, lng

  return coordinates;
}

module.exports = getCoordsForAddress;
