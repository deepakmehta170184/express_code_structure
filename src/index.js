/* eslint-disable*/
import http from "http";
//import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import glob from "glob";
import bodyParser from "body-parser";
import paginate from "express-paginate";
//import auth from "./middleware/auth";

const logger = require("./lib/logger");
const dotenv = require("dotenv").config({
	path: "./.env"
});
const db = require("./db");
const auth = require("./middleware/auth");

const app = express();
app.disable("x-powered-by");
app.server = http.createServer(app);

logger.debug("Overriding 'Express' logger");
app.use(morgan("combined", { stream: logger.stream }));

//For savedSearch CRON
const CronJob = require("cron").CronJob;
const request = require("request");
const fs = require("fs");

if (process.env.NODE_ENV === "development") {
	const loggerFormat =
		"\x1b[34m:id (:remote-addr)\x1b[0m :remote-user [:date[web]] \x1b[33m:method\x1b[0m \x1b[36m:url\x1b[0m \x1b[33m:status\x1b[0m :response-time ms - :res[content-length] :referrer \x1b[34m:user-agent\x1b[0m";

	app.use(morgan(loggerFormat, { stream: logger.stream }));
}

// logger
//app.use(morgan("dev"));
//app.use(morgan("combined", { "stream": logger.stream }));
app.use(cors());

// 3rd party middleware
app.use(
	cors({
		exposedHeaders: process.env.corsHeaders
	})
);
app.use(
	bodyParser.json({
		limit: process.env.bodyLimit
	})
);
app.use(
	bodyParser.urlencoded({
		extended: true,
		limit: process.env.bodyLimit
	})
);

const initRoutes = app => {
	// including all routes
	glob(
		"./routes/*.js",
		{
			cwd: path.resolve("./src")
		},
		(err, routes) => {
			if (err) {
				logger.error("Error occured including routes");
				return;
			}
			routes.forEach(routePath => {
				logger.info(`Including route: ${routePath}`);
				require(routePath).default(app); // eslint-disable-line
			});
			logger.info("included " + routes.length + " route files");

			// catch 404 and forward to error handler
			app.use((req, res, next) => {
				res.status(404).send("Not Found");
			});
		}
	);
};

initRoutes(app);
app.listen(process.env.PORT);
logger.info("Started on port " + process.env.PORT);

// Show unhandled rejections
process.on("unhandledRejection", function(reason, promise) {
	logger.error("Got an unhandled rejection:");
	logger.debug(reason);
	logger.debug(promise);
});

// Add token verification to all requests, to add a user if one exists
app.use(auth.hasToken);

// Add pagination to all endpoints (though most won't require it)
app.use(paginate.middleware(0, 100));

//CRON for savedSearch

var job = new CronJob({
	// cronTime: "0 */1 * * * *",		//for testing
	cronTime: "0 0 0 * * *",		//every midnight
	onTick: function() {
		const options = {
			url: process.env.host + "/listings/getSavedSearch", 
			method: "GET",
			headers: {
				Accept: "application/json",
				"Accept-Charset": "utf-8"
			}
		};
		request(options, function(err, res, body) {
			const filePath = path.join(__dirname, "/uploads/cron");
			let filefullpath = filePath + "/savedSearchLog.txt";
			if (!err && res.statusCode == 200) {
				let logMessage = JSON.parse(body).message + "\n";
				fs.appendFile(filefullpath, logMessage, function(err) {
					if (err) {
						logger.error("Error writing to log file");
						logger.error(err);
						console.log("error", err);
					} else {
						logger.info("log file saved.");
						console.log("log file saved.");
					}
				});
			} else {
				fs.appendFile(filefullpath, err, function(err) {
					if (err) {
						console.log("error", err);
						logger.error(err);
					} 
				})
				
			}
		});
	},
	start: false
	// timezone: "America/Los_Angeles"
});
job.start();

export default app;
