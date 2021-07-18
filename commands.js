var lastPing, pingCounter, timeInMiliseconds, playlistLink; //For ping and pong reasons xD 
var specialIntervalId = 0;
var main = require("./main");
const { errorLogger, infoLogger, warnLogger } = require("./logger"); //Import all the custom loggers
const { Prefix } = require("./models/prefixSchema");
const { BotConfigsLog } = require("./models/botConfigsLogSchema");
const { BotConfigs } = require("./models/botConfigsSchema");

//lastPing- saves the Id of the person that called the last ping command
//pingCounter - Saves how many times the same person called the ping command
module.exports = {
    ping(message, client) {
        try {
            if (lastPing === message.author.id) { //If is the same person that called the ping command before
                pingCounter++;
                if (pingCounter >= 5) { //If the same person has called the ping command 5 or more times in a row
                    message.channel.send("...").then((m) => { //Send a "..." message and then
                        var latency = m.createdTimestamp - message.createdTimestamp; //Calculate ao many ms the user has (I think it doesn't work very well)
                        var botPing = client.ws.ping; //Saves the bot ping
                        //Edit the "..." message with the one with the calculated pings
                        m.edit("Oh... Sorry... Right! My ping is " + botPing + "ms and yours is more or less " + latency + "ms");
                    });
                    lastPing = message.author.id; //Saves who called the ping command
                    pingCounter = 1; //Reset the ping counter
                } else {
                    message.reply("Pong");
                }
            } else {
                lastPing = message.author.id;
                pingCounter = 1;
                message.reply("Pong");
            }
        } catch (error) {
            errorLogger.error("Error on ping command. Errors:", error);
        }
    },
    delete(args, message, prefix) {
        try {
            if (args[0] == "del") {
                args[2] = args[1];
            }
            if (args[1] !== "messages" && args[0] !== "del") { //args[1] is the second word from the command
                return message.reply("Did you mean \"" + prefix + "delete messages\"?"); //Send a warning message to the user
            } else {
                if (!args[2] || !Number.isInteger(parseInt(args[2], 10))) { //Verify if the third "word" from the command is a number
                    message.reply("Type the number of messages you want to delete, for example \"" + prefix + "delete messages 2\""); //Send a warning message to the user
                } else {
                    if (message.member.hasPermission("ADMINISTRATOR")) { //Only proceed to the deletion of the messages if the user is an admin
                        //args[2] is the number of messages the user wants to delete
                        if (parseInt(args[2], 10) > 99) {
                            return message.reply("You can only delete 99 messages!");
                        }
                        if (parseInt(args[2], 10) < 0) {
                            return message.reply("Think a little bit of what you asked me to do... Did you really thought you could delete negative messages? Pff humans...");
                        }
                        if (parseInt(args[2], 10) === 0) {
                            return message.reply("Nothing deleted! Because you know... 0 is nothing human...");
                        }
                        let n = args[2];
                        n++;
                        message.channel.bulkDelete(n); //Delte the number of messages requested by the user
                        if (parseInt(args[2], 10) === 1) {
                            message.reply(args[2] + " message has been deleted!").then((message) => {
                                message.delete({ timeout: 5000 }); //Delete the success message after 5 seconds
                            }).catch(errorLogger.error);
                        } else {
                            message.reply(args[2] + " messages has been deleted!").then((message) => {
                                message.delete({ timeout: 3000 });
                            }).catch(errorLogger.error);
                        }
                    } else {
                        message.reply("Only admins can delete messages!");
                    }
                }
            }
        } catch (error) {
            errorLogger.error("Error on delete command. Errors:", error);
        }
    },
    help(args, Discord, message, prefix, botName) {
        try {
            if (!args[1] && args[0] !== "hc") {
                const helpEmbed = new Discord.MessageEmbed()
                    .setColor("#339933")
                    .setTitle(botName + " Help Menu")
                    .addFields({
                        name: "Commands List",
                        value: prefix + "help commands"
                    }, {
                        name: "\u200B",
                        value: "\u200B"
                    }, {
                        name: "See my code on GitHub!",
                        value: "https://github.com/IIIRataxIII/Ace-Bot"
                    }); //Create a personalized embed message
                message.channel.send(helpEmbed); //Send that embed message
            } else {
                try {
                    if (args[1] !== "commands" && args[0] !== "hc") {
                        return message.reply("Sorry I don\'t recognize that command, but if you want type \"" + prefix + "help commands\" to see what I can do.");
                    }
                    const helpCommandsEmbed = new Discord.MessageEmbed()
                        .setColor("#339933")
                        .setTitle("Commands List")
                        .addFields({
                            name: prefix + "ping",
                            value: "The bot responds with \"pong\", but to know your ping you really have to insist a little bit"
                        }, {
                            name: prefix + "delete messages <number>",
                            value: "The bot deletes a certain number of messages. Only admins can use this command."
                        }, {
                            name: prefix + "hug <@someone>",
                            value: "The bot gives a hug to someone you mention. You can mention yourself don\'t be shy!"
                        }, {
                            name: prefix + "bot ping",
                            value: "Says the ping value of the bot"
                        }, {
                            name: prefix + "my ping",
                            value: "Say the value of your ping (kind of... is a little bit complicated xD)"
                        }, {
                            name: prefix + "prefix $",
                            value: "Change the prefix for the bot commands"
                        });
                    message.channel.send(helpCommandsEmbed);
                } catch (error) {
                    errorLogger.error("Error on help list of commands command. Errors:", error);
                }
            }
        } catch (error) {
            errorLogger.error("Error on help command. Errors:", error);
        }
    },
    hug(args, message, prefix, currentBotDiscordId) {
        try {
            if (!args[1] || args[1].charAt(1) !== "@") { //If the second word of the command isn't a mention
                return message.reply("Mention who you want to hug, for example \"" + prefix + "hug <@!" + currentBotDiscordId + ">\"");
            }
            if (args[1] === "<@!" + currentBotDiscordId + ">") { //If the user mentioned the bot
                message.channel.send("I hugged myself at the request of <@!" + message.author.id + ">");
            } else if (args[1] === "<@!" + message.author.id + ">") { //If the user mentioned himself
                message.reply("I hugged you!");
            } else {
                message.channel.send("I hugged " + args[1] + " at the request of <@!" + message.author.id + ">");
            }
        } catch (error) {
            errorLogger.error("Error on hug command. Errors:", error);
        }
    },
    bot(args, message, prefix, client) {
        try {
            if (args[1] !== "ping" && args[0] !== "bp") {
                return message.reply("Did you mean \"" + prefix + "bot ping\"?");
            }
            message.channel.send("Testing connection...").then((m) => { //Send a temporary message and then
                var botPing = client.ws.ping; //Saves the bot ping
                m.edit("My ping is: " + botPing + "ms"); //Edit the temporary message with the one with the calculated ping
            });
        } catch (error) {
            errorLogger.error("Error on bot ping command. Errors:", error);
        }
    },
    my(args, message, prefix) {
        try {
            if (args[1] !== "ping" && args[0] !== "mp") {
                return message.reply("Did you mean \"" + prefix + "my ping\"?");
            }
            message.channel.send("Testing your connection...").then((m) => { //Send a temporary message and then
                var latency = m.createdTimestamp - message.createdTimestamp; //Calculate ao many ms the user has (I think it doesn't work very well)
                m.edit("Your ping is more or less: " + latency + "ms"); //Edit the temporary message with the one with the calculated ping
            });
        } catch (error) {
            errorLogger.error("Error on my ping command. Errors:", error);
        }
    },
    specialCommand(args, message, prefix, client, botName) {
        try {
            if (args[1] !== "special") {
                return message.reply("Did you mean \"" + prefix + "start special command\"?");
            }
            if (args[2] !== "command") {
                return message.reply("Did you mean \"" + prefix + "start special command\"?");
            }
            if (message.guild.id === process.env.SPECIAL_GUILD_ID) {
                if (message.member.hasPermission("ADMINISTRATOR")) {
                    if (specialIntervalId === 0) {
                        if (!args[3]) {
                            return message.reply("You need to specify the playlist link. For example: \"" + prefix + "start special command https://www.youtube.com/playlist?list=PL634F2B56B8C346A2\"");
                        }
                        if (!args[4]) {
                            return message.reply("You need to specify the hours, minutes and seconds of the playlist in the format <hh.mm.ss>. For example: \"" + prefix + "start special command <playlist link> **17.32.43**\"");
                        }
                        if (args[4].split(".").length !== 3) {
                            return message.reply("You need to specify the hours, minutes and seconds of the playlist in the format <hh.mm.ss>. For example: \"" + prefix + "start special command <playlist link> **17.32.43**\"");
                        }
                        var times = args[4].split(".");
                        if (isNaN(times[0])) {
                            return message.reply("The hours value need to be a number. For example: \"" + prefix + "start special command <playlist link> **17**.32.43\"");
                        }
                        if (isNaN(times[1])) {
                            return message.reply("The minutes value need to be a number. For example: \"" + prefix + "start special command <playlist link> 17.**32**.43\"");
                        }
                        if (isNaN(times[2])) {
                            return message.reply("The seconds value need to be a number. For example: \"" + prefix + "start special command <playlist link> 17.32.**43**\"");
                        }
                        if (times[1] > 60) {
                            return message.reply("The minutes value can't be more than 60. For example: \"" + prefix + "start special command <playlist link> 17.**32**.43\"");
                        }
                        if (times[2] > 60) {
                            return message.reply("The seconds value can't be more than 60. For example: \"" + prefix + "start special command <playlist link> 17.32.**43**\"");
                        }
                        if (times[0] < 0) {
                            return message.reply("The hours value can't be less than 0. For example: \"" + prefix + "start special command <playlist link> **17**.32.43\"");
                        }
                        if (times[1] < 0) {
                            return message.reply("The hours value can't be less than 0. For example: \"" + prefix + "start special command <playlist link> 17.**32**.43\"");
                        }
                        if (times[2] < 0) {
                            return message.reply("The hours value can't be less than 0. For example: \"" + prefix + "start special command <playlist link> 17.32.**43**\"");
                        }
                        if (!client.channels.cache.get(process.env.SPECIAL_VOICE_CHANNEL)) {
                            errorLogger.error("The voice channel does not exist!");
                            return message.reply("Something went wrong. Contact the " + botName + " creator for more instructions.");
                        }
                        if (!client.channels.cache.get(process.env.SPECIAL_TEXT_CHANNEL)) {
                            errorLogger.error("The voice channel does not exist!");
                            return message.reply("Something went wrong. Contact the " + botName + " creator for more instructions.");
                        }
                        timeInMiliseconds = (times[0] * 3600000) + (times[1] * 60000) + (times[2] * 1000);
                        if (timeInMiliseconds <= 0) {
                            return message.reply("The ammount of time can't be 00.00.00. For example: \"" + prefix + "start special command <playlist link> 17.32.**43**\"");
                        }
                        try {
                            timeInMiliseconds += 60000;
                            playlistLink = args[3];
                            specialIntervalId = setInterval(main.specialTimer, timeInMiliseconds, (playlistLink));
                            main.specialTimer(playlistLink);
                            message.reply("Special command started!");
                            infoLogger.log("Special command started.");
                        } catch (error) {
                            errorLogger.error("Error on initializing the special timer on the special command. Errors:", error);
                        }
                    } else {
                        message.reply("Special command is already running. If you need to ajust it stop it first with the command \"" + prefix + "stop special command\"");
                    }
                } else {
                    message.reply("Command for special people only!");
                }
            } else {
                message.reply("Command for a special server only!");
            }
        } catch (error) {
            errorLogger.error("Error on special command. Errors:", error);
        }
    },
    stopSpecialCommand(args, message, prefix) {
        try {
            if (args[1] !== "special") {
                return message.reply("Did you mean \"" + prefix + "stop special command\"?");
            }
            if (args[2] !== "command") {
                return message.reply("Did you mean \"" + prefix + "stop special command\"?");
            }
            if (message.member.hasPermission("ADMINISTRATOR")) {
                if (specialIntervalId === 0) {
                    message.reply("Special command is not running.");
                } else {
                    clearInterval(specialIntervalId);
                    specialIntervalId = 0;
                    timeInMiliseconds = 0;
                    playlistLink = "";
                    message.reply("Special command stopped.");
                    infoLogger.log("Special command stopped.");
                }
            } else {
                message.reply("Command for special people only!");
            }
        } catch (error) {
            errorLogger.error("Error on stop special command. Errors:", error);
        }
    },
    async changePrefix(args, message, prefix) {
        try {
            if (!args[1]) {
                return message.reply("You need to specify the new prefix you want. Example: \"" + prefix + "prefix !\"");
            }
            var prefixes = await Prefix.find({ guildId: message.guild.id });
            if (!prefixes.length || prefixes.length === 0) {
                var newPrefix = new Prefix({ prefix: args[1], guildId: message.guild.id, updatedBy: message.author.id });
                newPrefix.save();
            } else {
                prefixes[0].prefix = args[1];
                prefixes[0].updatedBy = message.author.id;
                await Prefix.findOneAndUpdate({ _id: prefixes[0]._id }, prefixes[0], { new: true, useFindAndModify: false });
                return message.reply("Prefix changed to \"" + args[1] + "\"!");
            }
        } catch (error) {
            errorLogger.error("Error on  command change prefix. Errors:", error);
        }
    },
    async changeBotSettings(args, message, client, prefix, Discord) {
        if (message.author.id != process.env.ACE_BOT_CREATOR_DISCORD_ID) {
            return message.reply("Sorry I don\'t recognize that command, but if you want type \"" + prefix + "help commands\" to see what I can do.");
        }
        if (!args[1]) {
            return message.reply("Did you mean \"" + prefix + "change status\"?"); //Send a warning message to the user
        }
        if (args[1] == "status") {
            if (!args[2] || isNaN(args[2]) || args[2] < 1 || args[2] > 4) {
                const statusEmbed = new Discord.MessageEmbed()
                    .setColor("#339933")
                    .setTitle("You need to specified the type of status you want!")
                    .addFields({
                        name: "For example: \"" + prefix + "change status **3** <status>\"",
                        value: "**The list of possible status is:**"
                    }, {
                        name: "1",
                        value: "Playing"
                    }, {
                        name: "2",
                        value: "Listening"
                    }, {
                        name: "3",
                        value: "Watching"
                    }, {
                        name: "4",
                        value: "Competing"
                    });
                return message.reply(statusEmbed); //Send a warning message to the user
            }
            if (!args[3]) {
                return message.reply("You need to specified the new status you want! For example: \"" + prefix + "change status 3 **This will be the new status**\""); //Send a warning message to the user
            }
            if (args[3].length > 128) {
                return message.reply("Status can't have more than 128 characters. You wrote a status with " + args[3].length + " characters.");
            }
            let auxString = prefix + args[0] + " " + args[1] + " " + args[2] + " ";
            let auxStatus = message.content.substr(auxString.length, message.content.length);
            let auxTypes = ["PLAYING", "LISTENING", "WATCHING", "COMPETING"];
            let auxTypeNumber = parseInt(args[2], 10) - 1;
            await client.user.setActivity(auxStatus, { type: auxTypes[auxTypeNumber] }).catch(errorLogger.error);
            warnLogger.warn("Bot status changed by " + message.author.username + " to " + auxTypes[auxTypeNumber] + " " + auxStatus);
            let checkConfigs = await BotConfigs.find({ config: "Status" });
            if (!checkConfigs.length || checkConfigs.length === 0) {
                let changedBotConfigs = await new BotConfigs({ config: "Status", value: auxStatus, value2: auxTypes[auxTypeNumber], value3: null, lastModifiedBy: message.author.id });
                await changedBotConfigs.save();
            } else {
                checkConfigs[0].value = auxStatus;
                checkConfigs[0].value2 = auxTypes[auxTypeNumber];
                checkConfigs[0].value3 = null;
                checkConfigs[0].lastModifiedBy = message.author.id;
                await BotConfigs.findOneAndUpdate({ _id: checkConfigs[0]._id }, checkConfigs[0], { new: true, useFindAndModify: false });
            }
            let changedBotConfigsLog = new BotConfigsLog({ changed: "Status", changedTo: auxStatus, changedTo2: auxTypes[auxTypeNumber], changedTo3: null, changedBy: message.author.username, changedById: message.author.id });
            await changedBotConfigsLog.save();
            return message.reply("Status successfully changed!");
        }
        return message.reply("Sorry I don\'t recognize that command, but if you want type \"" + prefix + "help commands\" to see what I can do.");
    }
};