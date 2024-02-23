require("dotenv").config(); //Import the .env library

var commands = require("./commands"); //Import the file were all the logic for each command is
const { Client, GatewayIntentBits, ActivityType } = require("discord.js"); //Import the Discord.js library
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
}); //Create a new Discord client
const { errorLogger, warnLogger, infoLogger } = require("./logger"); //Import all the custom loggers
const { Prefix } = require("./models/prefixSchema");
const { BotConfigs } = require("./models/botConfigsSchema");
const { BotAdmin } = require("./models/botAdminsSchema");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var api = require("./api.js");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
var mongoose = require("mongoose");

var isDevMode,
  currentBotDiscordId,
  botName,
  prefix,
  serverOn,
  currentYear = 0; //isDevMode - Boolean that is used on the code to know if we are using the dev bot or the real one
//currentBotDiscordId - Keeps the discord id from the bot

var del_command_timeouts = Object.create(null);

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

  client.once("ready", async () => {
    //When the bot is ready and online execute this block of code
    try {
      isDevMode =
        process.env.RATOT_CURRENT_TOKEN === process.env.RATOT_DEV_TOKEN; // If current token is from the dev bot then it isDevMode is true
      if (isDevMode) {
        //If we are using the dev bot
        botName = process.env.BOT_NAME_DEV;
        infoLogger.info(botName + " is online!");
        currentBotDiscordId = process.env.RATOT_DEV_DISCORD_ID; //The currentBotDiscordId is the dev bot ID
        infoLogger.info("Bot in dev mode.");
      } else {
        botName = process.env.BOT_NAME_PROD;
        infoLogger.info(botName + " is online!");
        currentBotDiscordId = process.env.RATOT_DISCORD_ID; //The currentBotDiscordId is the real bot ID
        infoLogger.info("Bot in production mode.");
      }
      let checkConfigs = await BotConfigs.find({
        config: "Status",
      });
      if (!checkConfigs.length || checkConfigs.length === 0) {
        try {
          client.user.setActivity("$help", {
            type: ActivityType.Listening,
          }); //Set an activity to the bot saying that he is listening to $help
          infoLogger.info('Bot status set to "LISTENING $help"');
        } catch (err) {
          errorLogger.error("Error on client.once method! Errors:", err);
        }
      } else {
        try {
          client.user.setActivity(checkConfigs[0].value, {
            type: checkConfigs[0].valueInt,
          });
          infoLogger.info(
            'Bot status set to "' +
              checkConfigs[0].value2 +
              " " +
              checkConfigs[0].value +
              '"'
          );
        } catch (err) {
          errorLogger.error("Error on client.once method! Errors:", err);
        }
      }

      //Verify if the creator is already on the database as an admin
      let checkAdmin = await BotAdmin.find({
        userId: process.env.RATOT_CREATOR_DISCORD_ID,
      });
      if (!checkAdmin.length || checkAdmin.length === 0) {
        let creator = new BotAdmin({
          userId: process.env.RATOT_CREATOR_DISCORD_ID,
          userName: process.env.RATOT_CREATOR_DISCORD_USERNAME,
          createdBy: process.env.RATOT_CREATOR_DISCORD_USERNAME,
          createdById: process.env.RATOT_CREATOR_DISCORD_ID,
        });
        creator.save();
      }
    } catch (error) {
      errorLogger.error("Error on client.once method! Errors:", error);
    }
  });

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

  client.on("messageCreate", async (message) => {
    //When the bot identifies a message
    try {
      var prefixes = await Prefix.find({
        guildId: message.guild.id,
      });
      if (!prefixes.length || prefixes.length === 0) {
        var newPrefix = new Prefix({
          prefix: "$",
          guildId: message.guild.id,
          updatedBy: currentBotDiscordId,
        });
        newPrefix.save();
        prefix = "$";
      } else {
        prefix = prefixes[0].prefix;
      }
      let args = message.content; //Keeps the message content
      var isCommand = args.substr(0, prefix.length) === prefix; //If the prefix is the one that the bot uses it is a command
      args = args.substring(prefix.length).split(" "); //Split the command by words and takes out the prefix
      if (isCommand) {
        //I think this is quite obvious too
        currentYear = new Date().getFullYear(); //Get the current year
        switch (
          args[0] //args[0] is the first word of the command and then depending on that word it seeks waht command to execute from the commands.js file
        ) {
          case "ping":
            commands.ping(message, client);
            break;
          case "delete":
          case "del":
            commands.delete(
              args,
              message,
              prefix,
              del_command_timeouts,
              client
            );
            break;
          case "help":
          case "h":
          case "hc":
            commands.help(args, message, prefix, botName, currentYear);
            break;
          case "hug":
            commands.hug(args, message, prefix, currentBotDiscordId, client);
            break;
          case "bot":
          case "bp":
            commands.bot(args, message, prefix, client);
            break;
          case "my":
          case "mp":
            commands.my(args, message, prefix);
            break;
          case "start":
            commands.specialCommand(args, message, prefix, client, botName);
            break;
          case "stop":
            commands.stopSpecialCommand(args, message, prefix);
            break;
          case "prefix":
          case "p":
            commands.changePrefix(args, message, prefix);
            break;
          case "change":
          case "cs":
            commands.changeBotSettings(
              args,
              message,
              client,
              prefix,
              currentYear,
              botName
            );
            break;
          case "add":
          case "a":
            commands.addCommand(
              args,
              message,
              client,
              prefix,
              currentBotDiscordId,
              currentYear,
              botName
            );
            break;
          case "remove":
          case "r":
            commands.removeCommand(
              args,
              message,
              client,
              prefix,
              currentBotDiscordId
            );
            break;
          case "list":
          case "ls":
          case "lc":
            commands.list(
              args,
              message,
              client,
              prefix,
              currentYear,
              botName
            );
            break;
        }
      }
    } catch (error) {
      errorLogger.error('Error on client.on("message"). Errors:', error);
    }
  });

  client.on("guildCreate", async (guild) => {
    try {
      var newPrefix = new Prefix({
        prefix: "$",
        guildId: guild.id,
        updatedBy: currentBotDiscordId,
      });
      await newPrefix.save();
      warnLogger.warn("Bot added to a new guild: " + guild.name);
    } catch (error) {
      errorLogger.error('Error on client.on("guildCreate"). Errors:', error);
    }
  });

  client.on("guildDelete", async (guild) => {
    try {
      await Prefix.deleteMany({
        guildId: guild.id,
      });
      warnLogger.warn("Bot kicked from a guild: " + guild.name);
    } catch (error) {
      errorLogger.error('Error on client.on("guildCreate"). Errors:', error);
    }
  });

  if (serverOn) {
    app.use("/", api);

    app.get("*", function (req, res) {
      infoLogger.info("Req: " + req + ", Res: " + res);
      //To Do Later
    });
  }

  client.login(process.env.RATOT_CURRENT_TOKEN); //Starts the bot
}
