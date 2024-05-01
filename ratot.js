require("dotenv").config(); //Import the .env library

const { Client, GatewayIntentBits } = require("discord.js"); //Import the Discord.js library
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
}); //Create a new Discord client
const { errorLogger, warnLogger, infoLogger } = require("./src/utils/logger.js"); //Import all the custom loggers
const eventHandler = require("./src/handlers/eventHandler.js");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var api = require("./src/api/api.js");
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: false,
	})
);
var mongoose = require("mongoose");

var serverOn;

//Code to rerun the bot when an exception occurs
var cluster = require("cluster");
if (cluster.isMaster) {
	cluster.fork();

	cluster.on("exit", function (worker, code, signal) {
		errorLogger.error(
			"FATAL ERROR! The bot stopped working and rerunned again!"
		);
		cluster.fork();
	});
}

if (cluster.isWorker) {
	try {
		mongoose.connect(process.env.DBURL);
		infoLogger.info("Connected to MongoDB");
	} catch (error) {
		errorLogger.error("Connected to MongoDB. Errors:", err);
	}

	var server = app
		.listen(process.env.PORT, () => {
			serverOn = true;
			infoLogger.info(
				"API Server is connected and listening on port " + server.address().port
			);
		})
		.on("error", (error) => {
			serverOn = false;
			errorLogger.error(
				"Error when trying to start express server! Error: ",
				error
			);
		});

	eventHandler(client);

	if (serverOn) {
		app.use("/", api);

		app.get("*", function (req, res) {
			infoLogger.info("Req: " + req + ", Res: " + res);
			//To Do Later
		});
	}

	client.login(process.env.RATOT_CURRENT_TOKEN); //Starts the bot
}
