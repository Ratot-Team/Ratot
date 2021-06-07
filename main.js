require("dotenv").config(); //Import the .env library

var commands = require("./commands"); //Import the file were all the logic for each command is

const Discord = require("discord.js"); //Import the Discord.js library

const client = new Discord.Client(); //Create a new Discord client

const token = process.env.ACE_BOT_TOKEN; //Create a variable to keep the token of the bot that is saved on the .env file

var isDevMode, currentBotDiscordId, playlistLink; //isDevMode - Boolean that is used on the code to know if we are using the dev bot or the real one
//currentBotDiscordId - Keeps the discord id from the bot

const prefix = "$"; //Keeps the prefix that the bot is listening. Is static for now...

client.once("ready", () => { //When the bot is ready and online execute this block of code
    console.log("Ace Bot is online!"); //I think this is quite obvious
    isDevMode = (token === process.env.ACE_BOT_DEV_TOKEN); // If token is from the dev bot then it isDevMode is true
    if (isDevMode) { //If we are using the dev bot
        currentBotDiscordId = process.env.ACE_BOT_DEV_DISCORD_ID; //The currentBotDiscordId is the dev bot ID
    } else {
        currentBotDiscordId = process.env.ACE_BOT_DISCORD_ID; //The currentBotDiscordId is the real bot ID
    }
    client.user.setActivity("$help", { type: "LISTENING" }).catch(console.error); //Set an activity to the bot saying that he is listening to $help
});

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
                    commands.help(args, Discord, message, prefix);
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
                    commands.specialCommand(args, message, prefix, client);
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
        console.error(error);
    }
});

function leaveChannelAfterMessage(channel) {
    channel.leave();
}

function messageToStartPlaylist(channel) {
    client.channels.cache.get(process.env.SPECIAL_TEXT_CHANNEL).send("24.play " + playlistLink);
    setTimeout(leaveChannelAfterMessage, 3000, (channel));
}

function specialTimer(link) {
    try {
        playlistLink = link;
        const channel = client.channels.cache.get(process.env.SPECIAL_VOICE_CHANNEL);

        if (!channel) {
            return console.error("The channel does not exist!");
        }

        channel.join().then(() => {
            setTimeout(messageToStartPlaylist, 3000, (channel));
        }).catch((e) => {
            console.error(e);
        });
        console.log("Special Timer runned successfully.");
    } catch (error) {
        console.error(error);
    }

}

client.login(token); //Starts the bot

exports.specialTimer = specialTimer;
