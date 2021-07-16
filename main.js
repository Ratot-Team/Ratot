require("dotenv").config(); //Import the .env library

var commands = require("./commands"); //Import the file were all the logic for each command is
const Discord = require("discord.js"); //Import the Discord.js library
const client = new Discord.Client(); //Create a new Discord client
const { errorLogger, warnLogger, infoLogger } = require("./logger"); //Import all the custom loggers
var fs = require("fs");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var api = require('./api.js');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var mongoose = require('mongoose');

const token = process.env.ACE_BOT_TOKEN; //Create a variable to keep the token of the bot that is saved on the .env file
const dbUrl = process.env.DBURL;

console.log = function() {
    return infoLogger.info.apply(infoLogger, arguments); //Overwrite system normal log function with the custom one
};
console.error = function() {
    return errorLogger.info.apply(errorLogger, arguments); //Overwrite system error function with the custom one
};
console.warn = function() {
    return warnLogger.info.apply(warnLogger, arguments); //Overwrite system warn function with the custom one
};

fs.writeFile("pid.pid", process.pid.toString(), (err) => {
    if (err) {
        return errorLogger.error(err);
    }
    infoLogger.info("Pid saved on pid.txt");
});

var isDevMode, currentBotDiscordId, playlistLink, botName; //isDevMode - Boolean that is used on the code to know if we are using the dev bot or the real one
//currentBotDiscordId - Keeps the discord id from the bot

const prefix = "$"; //Keeps the prefix that the bot is listening. Is static for now...

client.once("ready", () => { //When the bot is ready and online execute this block of code
    try {
        isDevMode = (token === process.env.ACE_BOT_DEV_TOKEN); // If token is from the dev bot then it isDevMode is true
        if (isDevMode) { //If we are using the dev bot
            botName = "Ace (Beta)"
            infoLogger.info(botName + " is online!")
            currentBotDiscordId = process.env.ACE_BOT_DEV_DISCORD_ID; //The currentBotDiscordId is the dev bot ID
            infoLogger.info("Bot in dev mode.");
        } else {
            botName = "Ace"
            infoLogger.info(botName + " is online!")
            currentBotDiscordId = process.env.ACE_BOT_DISCORD_ID; //The currentBotDiscordId is the real bot ID
            infoLogger.info("Bot in production mode.");
        }
        client.user.setActivity("$help", { type: "LISTENING" }).catch(errorLogger.error); //Set an activity to the bot saying that he is listening to $help
        infoLogger.info("Bot status set to \"Listening to $help\"");
    } catch (error) {
        errorLogger.error("Error on client.once method! Errors:", error);
    }
});

try {
    var server = app.listen(process.env.PORT, () => {
        infoLogger.info('API Server is connected and listening on port ' + server.address().port)
    })
} catch (error) {
    errorLogger.error("Error on starting the API server! Errors:", error);
}

mongoose.connect(dbUrl, { useUnifiedTopology: true, useNewUrlParser: true }, (err) => {
    if (!err) {
        infoLogger.info("Connected to MongoDB");
    } else {
        errorLogger.error("Connected to MongoDB. Errors:", err)
    }
})

client.on("message", (message) => { //When the bot identifies a message 
    try {
        let args = message.content; //Keeps the message content
        var isCommand = args.charAt(0) === prefix; //If the prefix is the one that the bot uses it is a command
        args = args.substring(prefix.length).split(" "); //Split the command by words and takes out the prefix
        if (isCommand) //I think this is quite obvious too
        {
            switch (args[0]) { //args[0] is the first word of the command and then depending on that word it seeks waht command to execute from the commands.js file
                case "ping":
                    commands.ping(message, client);
                    break;
                case "delete":
                    commands.delete(args, message, prefix);
                    break;
                case "help":
                    commands.help(args, Discord, message, prefix, botName);
                    break;
                case "hug":
                    commands.hug(args, message, prefix, currentBotDiscordId);
                    break;
                case "bot":
                    commands.bot(args, message, prefix, client);
                    break;
                case "my":
                    commands.my(args, message, prefix);
                    break;
                case "start":
                    commands.specialCommand(args, message, prefix, client, botName);
                    break;
                case "stop":
                    commands.stopSpecialCommand(args, message, prefix);
                    break;
                default: //If is none of the previous commands
                    if (isCommand) {
                        message.reply("Sorry I don\'t recognize that command, but if you want type \"" + prefix + "help commands\" to see what I can do.");
                    }
                    break;
            }
        }
    } catch (error) {
        errorLogger.error("Error on client.on(\"message\"). Errors:", error);
    }
});

app.use('/', api);

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + "/public/404frontoffice.html"))
});

function leaveChannelAfterMessage(channel) {
    try {
        channel.leave();
    } catch (error) {
        errorLogger.error("Error on leaving channel on special timer. Errors:", error);
    }
}

function messageToStartPlaylist(channel) {
    try {
        client.channels.cache.get(process.env.SPECIAL_TEXT_CHANNEL).send("24.play " + playlistLink);
        setTimeout(leaveChannelAfterMessage, 3000, (channel));
    } catch (error) {
        errorLogger.error("Error on sending message to start playlist on special timer. Errors:", error);
    }
}

function specialTimer(link) {
    try {
        playlistLink = link;
        const channel = client.channels.cache.get(process.env.SPECIAL_VOICE_CHANNEL);

        if (!channel) {
            return warnLogger.warn("The channel chosed on special timer doesn't exist!");
        }

        channel.join().then(() => {
            setTimeout(messageToStartPlaylist, 3000, (channel));
        }).catch((e) => {
            errorLogger.error("Error on entering voice channel on special timer. Errors:", e);
        });

        infoLogger.info("Special Timer runned successfully.");
    } catch (error) {
        errorLogger.error("Error on special timer. Errors:", error);
    }

}

client.login(token); //Starts the bot

exports.specialTimer = specialTimer;