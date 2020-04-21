const express = require("express");

const app = express();

app.use(express.static("starter/dist"));
app.enable("trust proxy"); //Heroku works by sending proxy this is for heroku

app.use("/css", express.static(__dirname + "/starter/dist/css"));
app.use("/js", express.static(__dirname + "/starter/dist/js"));
app.use("/img", express.static(__dirname + "/starter/dist/images"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
