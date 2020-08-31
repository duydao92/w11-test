/**
 * TODO: Create and configure your Express.js application in here.
 *       You must name the variable that contains your Express.js
 *       application "app" because that is what is exported at the
 *       bottom of the file.
 */
const express = require("express");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const port = process.env.PORT || 8081;

const app = express();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})






























/* Do not change this export. The tests depend on it. */
try {
  exports.app = app;
} catch(e) {
  exports.app = null;
}
