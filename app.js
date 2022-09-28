var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var ParseServer = require("parse-server").ParseServer;

var ParseDashboard = require("parse-dashboard");
var cors = require('cors');

require("dotenv").config();

var port = process.env.PORT || 1337;

var indexRouter = require("./routes/index");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public", { maxAge: 31557600000 }));


var appServer = new ParseServer({
    databaseURI: process.env.databaseURI, // Connection string for your MongoDB database
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/vehiclepooling/main.js",
    appId: 'Vehiclepooling',
    masterKey: process.env.masterKey,
    javascriptKey:process.env.javascriptKey,
    restAPIKey:process.env.restAPIKey,
    serverURL: `${process.env.serverUrl}/Vehiclepooling`,
  });
  
var mountPath = process.env.PARSE_MOUNT || '/Vehiclepooling';
app.use(mountPath, appServer);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
  var dashboard = new ParseDashboard(
    {
      apps: [
        
        {
          serverURL: `${process.env.serverUrl}/Vehiclepooling`,
          appId: "Vehiclepooling",
          masterKey: process.env.masterKey,
          restAPIKey:process.env.restAPIKey,
          appName: "Vehiclepooling"
        },
    ],
    users: [
      {
        user: process.env.masterUsername,
        pass: process.env.masterPassword
      }
    ]
  },
  { allowInsecureHTTP: true }
);


// make the Parse Dashboard available at /dashboard
app.use("/dashboard", dashboard);

app.use(cors());
// Add headers

var httpServer = require("http").createServer(app);
httpServer.listen(port);

module.exports = app;