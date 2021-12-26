var lastPing, pingCounter, timeInMiliseconds, playlistLink; //For ping and pong reasons xD
var specialIntervalId = 0;
const { errorLogger, infoLogger, warnLogger } = require("./logger"); //Import all the custom loggers
const { Prefix } = require("./models/prefixSchema");
const { BotConfigsLog } = require("./models/botConfigsLogSchema");
const { BotConfigs } = require("./models/botConfigsSchema");
const { BotAdmin } = require("./models/botAdminsSchema");

//lastPing- saves the Id of the person that called the last ping command
//pingCounter - Saves how many times the same person called the ping command
module.exports = {
    ping(message, client) {
        try {
            if (lastPing === message.author.id) {
                //If is the same person that called the ping command before
                pingCounter++;
                if (pingCounter >= 5) {
                    //If the same person has called the ping command 5 or more times in a row
                    message
                        .reply({
                            content: "...",
                        })
                        .then((m) => {
                            //Send a "..." message and then
                            var latency = m.createdTimestamp - message.createdTimestamp; //Calculate ao many ms the user has (I think it doesn't work very well)
                            var botPing = client.ws.ping; //Saves the bot ping
                            //Edit the "..." message with the one with the calculated pings
                            m.edit(
                                "Oh... Sorry... Right! My ping is " +
                                botPing +
                                "ms and yours is more or less " +
                                latency +
                                "ms"
                            );
                        });
                    lastPing = message.author.id; //Saves who called the ping command
                    pingCounter = 1; //Reset the ping counter
                } else {
                    message.reply({
                        content: "Pong",
                    });
                }
            } else {
                lastPing = message.author.id;
                pingCounter = 1;
                message.reply({
                    content: "Pong",
                });
            }
        } catch (error) {
            errorLogger.error("Error on ping command. Errors:", error);
            message.channel.send(
                "Aconteceu algo de errado ao tentar executar esse comando..."
            );
        }
    },
    delete(args, message, prefix, Permissions) {
        try {
            if (args[0] === "del") {
                args[2] = args[1];
            }
            if (args[1] !== "messages" && args[0] !== "del") {
                //args[1] is the second word from the command
                return message.reply({
                    content: 'Did you mean "' + prefix + 'delete messages"?',
                }); //Send a warning message to the user
            } else {
                if (!args[2] || !Number.isInteger(parseInt(args[2], 10))) {
                    //Verify if the third "word" from the command is a number
                    message.reply({
                        content: 'Type the number of messages you want to delete, for example "' +
                            prefix +
                            'delete messages 2"',
                    }); //Send a warning message to the user
                } else {
                    if (
                        message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
                        message.member
                        .permissionsIn(message.channel)
                        .has(Permissions.FLAGS.MANAGE_MESSAGES)
                    ) {
                        //Only proceed to the deletion of the messages if the user is an admin
                        //args[2] is the number of messages the user wants to delete
                        if (parseInt(args[2], 10) > 99) {
                            return message.reply({
                                content: "You can only delete 99 messages!",
                            });
                        }
                        if (parseInt(args[2], 10) < 0) {
                            return message.reply({
                                content: "Think a little bit of what you asked me to do... Did you really thought you could delete negative messages? Pff humans...",
                            });
                        }
                        if (parseInt(args[2], 10) === 0) {
                            return message.reply({
                                content: "Nothing deleted! Because you know... 0 is nothing human...",
                            });
                        }
                        let n = args[2];
                        n++;
                        message.channel.bulkDelete(n); //Delte the number of messages requested by the user
                        if (parseInt(args[2], 10) === 1) {
                            try {
                                message.channel
                                    .send({
                                        content: args[2] + " message has been deleted!",
                                    })
                                    .then((message) => {
                                        setTimeout(() => message.delete(), 5000); //Delete the success message after 5 seconds
                                    });
                            } catch (err) {
                                errorLogger.error("Error on delete command. Errors:", err);
                                message.channel.send(
                                    "Aconteceu algo de errado ao tentar executar esse comando..."
                                );
                            }
                        } else {
                            try {
                                message.channel
                                    .send({
                                        content: args[2] + " messages has been deleted!",
                                    })
                                    .then((message) => {
                                        setTimeout(() => message.delete(), 3000);
                                    });
                            } catch (error) {
                                errorLogger.error("Error on delete command. Errors:", error);
                                message.channel.send(
                                    "Aconteceu algo de errado ao tentar executar esse comando..."
                                );
                            }
                        }
                    } else {
                        message.reply({
                            content: "Only users with the manage messages permission can delete messages!",
                        });
                    }
                }
            }
        } catch (error) {
            errorLogger.error("Error on delete command. Errors:", error);
            message.channel.send(
                "Aconteceu algo de errado ao tentar executar esse comando..."
            );
        }
    },
    help(args, Discord, message, prefix, botName) {
        try {
            if (!args[1] && args[0] !== "hc") {
                const helpEmbed = new Discord.MessageEmbed()
                    .setColor("#000000")
                    .setTitle(botName + " Help Menu")
                    .addFields({
                        name: "Commands List",
                        value: prefix + "help commands",
                    }, {
                        name: "\u200B",
                        value: "\u200B",
                    }, {
                        name: "See my code on GitHub!",
                        value: "https://github.com/Ace-Bot-Team/Ace-Bot",
                    })
                    .setTimestamp()
                    .setThumbnail(
                        "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                    )
                    .setAuthor(
                        "Ace",
                        "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                    )
                    .setFooter(
                        "Copyright © 2020-2021 by Captain Ratax",
                        "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                    ); //Create a personalized embed message
                message.reply({
                    embeds: [helpEmbed],
                }); //Send that embed message
            } else {
                try {
                    if (args[1] !== "commands" && args[0] !== "hc") {
                        return message.reply({
                            content: "Sorry I don't recognize that command, but if you want type \"" +
                                prefix +
                                'help commands" to see what I can do.',
                        });
                    }
                    const helpCommandsEmbed = new Discord.MessageEmbed()
                        .setColor("#000000")
                        .setTitle("Commands List")
                        .addFields({
                            name: prefix + "ping",
                            value: 'The bot responds with "pong", but to know your ping you really have to insist a little bit',
                        }, {
                            name: prefix + "delete messages <number>",
                            value: "The bot deletes a certain number of messages. Only admins can use this command.",
                        }, {
                            name: prefix + "hug <@someone>",
                            value: "The bot gives a hug to someone you mention. You can mention yourself don't be shy!",
                        }, {
                            name: prefix + "bot ping",
                            value: "Says the ping value of the bot",
                        }, {
                            name: prefix + "my ping",
                            value: "Say the value of your ping (kind of... is a little bit complicated xD)",
                        }, {
                            name: prefix + "prefix <prefix>",
                            value: "Change the prefix for the bot commands",
                        })
                        .setTimestamp()
                        .setThumbnail(
                            "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                        )
                        .setAuthor(
                            "Ace",
                            "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                        )
                        .setFooter(
                            "Copyright © 2020-2021 by Captain Ratax",
                            "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                        );
                    message.reply({
                        embeds: [helpCommandsEmbed],
                    });
                } catch (error) {
                    errorLogger.error(
                        "Error on help list of commands command. Errors:",
                        error
                    );
                    message.channel.send(
                        "Aconteceu algo de errado ao tentar executar esse comando..."
                    );
                }
            }
        } catch (error) {
            errorLogger.error("Error on help command. Errors:", error);
            message.channel.send(
                "Aconteceu algo de errado ao tentar executar esse comando..."
            );
        }
    },
    hug(args, message, prefix, currentBotDiscordId) {
        try {
            if (!args[1] || args[1].charAt(1) !== "@") {
                //If the second word of the command isn't a mention
                return message.reply({
                    content: 'Mention who you want me to hug, for example "' +
                        prefix +
                        "hug <@!" +
                        currentBotDiscordId +
                        '>"',
                });
            }
            if (args[1] === "<@!" + currentBotDiscordId + ">") {
                //If the user mentioned the bot
                message.channel.send({
                    content: "I hugged myself as requested by <@!" + message.author.id + ">",
                });
            } else if (args[1] === "<@!" + message.author.id + ">") {
                //If the user mentioned himself
                message.reply({
                    content: "I hugged you!",
                });
            } else {
                message.channel.send({
                    content: "I hugged " +
                        args[1] +
                        " as requested by <@!" +
                        message.author.id +
                        ">",
                });
            }
        } catch (error) {
            errorLogger.error("Error on hug command. Errors:", error);
            message.channel.send(
                "Aconteceu algo de errado ao tentar executar esse comando..."
            );
        }
    },
    bot(args, message, prefix, client) {
        try {
            if (args[1] !== "ping" && args[0] !== "bp") {
                return message.reply({
                    content: 'Did you mean "' + prefix + 'bot ping"?',
                });
            }
            message
                .reply({
                    content: "Testing connection...",
                })
                .then((m) => {
                    //Send a temporary message and then
                    var botPing = client.ws.ping; //Saves the bot ping
                    m.edit("My ping is: " + botPing + "ms"); //Edit the temporary message with the one with the calculated ping
                });
        } catch (error) {
            errorLogger.error("Error on bot ping command. Errors:", error);
            message.channel.send(
                "Aconteceu algo de errado ao tentar executar esse comando..."
            );
        }
    },
    my(args, message, prefix) {
        try {
            if (args[1] !== "ping" && args[0] !== "mp") {
                return message.reply({
                    content: 'Did you mean "' + prefix + 'my ping"?',
                });
            }
            message
                .reply({
                    content: "Testing your connection...",
                })
                .then((m) => {
                    //Send a temporary message and then
                    var latency = m.createdTimestamp - message.createdTimestamp; //Calculate ao many ms the user has (I think it doesn't work very well)
                    m.edit("Your ping is more or less: " + latency + "ms"); //Edit the temporary message with the one with the calculated ping
                });
        } catch (error) {
            errorLogger.error("Error on my ping command. Errors:", error);
            message.channel.send(
                "Aconteceu algo de errado ao tentar executar esse comando..."
            );
        }
    },
    async changePrefix(args, message, prefix) {
        try {
            if (!args[1]) {
                return message.reply({
                    content: 'You need to specify the new prefix you want. Example: "' +
                        prefix +
                        'prefix !"',
                });
            }
            var prefixes = await Prefix.find({
                guildId: message.guild.id,
            });
            if (!prefixes.length || prefixes.length === 0) {
                var newPrefix = new Prefix({
                    prefix: args[1],
                    guildId: message.guild.id,
                    updatedBy: message.author.id,
                });
                newPrefix.save();
            } else {
                prefixes[0].prefix = args[1];
                prefixes[0].updatedBy = message.author.id;
                await Prefix.findOneAndUpdate({
                        _id: prefixes[0]._id,
                    },
                    prefixes[0], {
                        new: true,
                        useFindAndModify: false,
                    }
                );
                return message.reply({
                    content: 'Prefix changed to "' + args[1] + '"!',
                });
            }
        } catch (error) {
            errorLogger.error("Error on  command change prefix. Errors:", error);
            message.channel.send(
                "Aconteceu algo de errado ao tentar executar esse comando..."
            );
        }
    },
    async changeBotSettings(args, message, client, prefix, Discord) {
        try {
            let checkAdmin = await BotAdmin.find({
                userId: message.author.id,
            });
            let isBotAdmin;
            if (!checkAdmin.length || checkAdmin.length === 0) {
                isBotAdmin =
                    message.author.id === process.env.ACE_BOT_CREATOR_DISCORD_ID;
            } else {
                isBotAdmin = true;
            }
            if (!isBotAdmin) {
                return message.reply({
                    content: "Sorry I don't recognize that command, but if you want type \"" +
                        prefix +
                        'help commands" to see what I can do.',
                });
            }
            if (args[0] === "cs") {
                args.splice(1, 0, "status");
            }
            if (!args[1]) {
                return message.reply({
                    content: 'Did you mean "' + prefix + 'change status"?',
                }); //Send a warning message to the user
            }
            if (args[1] === "status") {
                if (!args[2] || isNaN(args[2]) || args[2] < 1 || args[2] > 4) {
                    const statusEmbed = new Discord.MessageEmbed()
                        .setColor("#000000")
                        .setTitle("You need to specify the type of status you want!")
                        .addFields({
                            name: 'For example: "' + prefix + 'change status **3** <status>"',
                            value: "**The list of possible status is:**",
                        }, {
                            name: "1",
                            value: "Playing",
                        }, {
                            name: "2",
                            value: "Listening to",
                        }, {
                            name: "3",
                            value: "Watching",
                        }, {
                            name: "4",
                            value: "Competing in",
                        })
                        .setTimestamp()
                        .setThumbnail(
                            "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                        )
                        .setAuthor(
                            "Ace",
                            "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                        )
                        .setFooter(
                            "Copyright © 2020-2021 by Captain Ratax",
                            "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                        );
                    return message.reply({
                        embeds: [statusEmbed],
                    }); //Send a warning message to the user
                }
                if (!args[3]) {
                    return message.reply({
                        content: 'You need to specified the new status you want! For example: "' +
                            prefix +
                            "change status " +
                            args[2] +
                            ' **This will be the new status**"',
                    }); //Send a warning message to the user
                }
                if (args[3].length > 128) {
                    return message.reply({
                        content: "Status can't have more than 128 characters. You wrote a status with " +
                            args[3].length +
                            " characters.",
                    });
                }
                let auxString = "";
                if (args[0] === "cs") {
                    auxString = prefix + args[0] + " " + args[2] + " ";
                } else {
                    auxString = prefix + args[0] + " " + args[1] + " " + args[2] + " ";
                }

                let auxStatus = message.content.substr(
                    auxString.length,
                    message.content.length
                );
                let auxTypes = ["PLAYING", "LISTENING", "WATCHING", "COMPETING"];
                let auxTypeNumber = parseInt(args[2], 10) - 1;
                try {
                    await client.user.setActivity(auxStatus, {
                        type: auxTypes[auxTypeNumber],
                    });
                } catch (err) {
                    errorLogger.error(
                        "Error on  command change bot settings. Errors:",
                        err
                    );
                    message.channel.send(
                        "Aconteceu algo de errado ao tentar executar esse comando..."
                    );
                }
                warnLogger.warn(
                    "Bot status changed by " +
                    message.author.username +
                    " to " +
                    auxTypes[auxTypeNumber] +
                    " " +
                    auxStatus
                );
                let checkConfigs = await BotConfigs.find({
                    config: "Status",
                });
                if (!checkConfigs.length || checkConfigs.length === 0) {
                    let changedBotConfigs = await new BotConfigs({
                        config: "Status",
                        value: auxStatus,
                        value2: auxTypes[auxTypeNumber],
                        value3: null,
                        lastModifiedBy: message.author.id,
                    });
                    await changedBotConfigs.save();
                } else {
                    checkConfigs[0].value = auxStatus;
                    checkConfigs[0].value2 = auxTypes[auxTypeNumber];
                    checkConfigs[0].value3 = null;
                    checkConfigs[0].lastModifiedBy = message.author.id;
                    await BotConfigs.findOneAndUpdate({
                            _id: checkConfigs[0]._id,
                        },
                        checkConfigs[0], {
                            new: true,
                            useFindAndModify: false,
                        }
                    );
                }
                let changedBotConfigsLog = new BotConfigsLog({
                    changed: "Status",
                    changedTo: auxStatus,
                    changedTo2: auxTypes[auxTypeNumber],
                    changedTo3: null,
                    changedBy: message.author.username,
                    changedById: message.author.id,
                });
                await changedBotConfigsLog.save();
                return message.reply({
                    content: "Status successfully changed!",
                });
            }
            return message.reply({
                content: "Sorry I don't recognize that command, but if you want type \"" +
                    prefix +
                    'help commands" to see what I can do.',
            });
        } catch (error) {
            errorLogger.error(
                "Error on  command change bot settings. Errors:",
                error
            );
            message.channel.send(
                "Aconteceu algo de errado ao tentar executar esse comando..."
            );
        }
    },
    async addCommand(
        args,
        message,
        client,
        prefix,
        Discord,
        currentBotDiscordId
    ) {
        try {
            let checkAdmin = await BotAdmin.find({
                userId: message.author.id,
            });
            let isBotAdmin;
            if (!checkAdmin.length || checkAdmin.length === 0) {
                isBotAdmin =
                    message.author.id === process.env.ACE_BOT_CREATOR_DISCORD_ID;
            } else {
                isBotAdmin = true;
            }
            if (!isBotAdmin) {
                return message.reply({
                    content: "Sorry I don't recognize that command, but if you want type \"" +
                        prefix +
                        'help commands" to see what I can do.',
                });
            }
            if (!args[1]) {
                return message.reply({
                    content: 'Did you mean "' + prefix + 'add admin"?',
                }); //Send a warning message to the user
            }
            if (args[1] === "admin") {
                if (!args[2] ||
                    args[2].substr(0, 2) !== "<@" ||
                    args[2].charAt(args[2].length - 1) !== ">"
                ) {
                    return message.reply({
                        content: 'You need to mention who you want to add as admin. For example: "' +
                            prefix +
                            "add admin <@" +
                            currentBotDiscordId +
                            '>"',
                    }); //Send a warning message to the user
                }
                let adminToAddId = args[2].substr(3, args[2].length - 4);
                if (adminToAddId === currentBotDiscordId) {
                    return message.reply({
                        content: "I cannot be my own administrator",
                    }); //Send a warning message to the user
                }
                let verifyUser = await BotAdmin.find({
                    userId: adminToAddId,
                });
                if (!verifyUser.length || verifyUser.length === 0) {
                    let adminToAddName = client.users.cache.find(
                        (user) => user.id === adminToAddId
                    ).username;
                    let newAdmin = new BotAdmin({
                        userId: adminToAddId,
                        userName: adminToAddName,
                        createdBy: message.author.username,
                        createdById: message.author.id,
                    });
                    newAdmin.save();
                    message.reply({
                        content: "<@!" + adminToAddId + "> is now an administrator!",
                    });
                    client.users.fetch(adminToAddId, false).then((user) => {
                        const adminEmbed = new Discord.MessageEmbed()
                            .setColor("#000000")
                            .setTitle(" Now you are an administrator of the Ace Bot!")
                            .setDescription("Here is some commands you can do now:")
                            .addFields({
                                name: "$change status <number of status> <status>",
                                value: "Change the status message of the bot",
                            }, {
                                name: "$add admin <@someone>",
                                value: "Add a new administrator to the bot **(don't do it without the creator permission!)**",
                            }, {
                                name: "$remove admin <@someone>",
                                value: "Remove an administrator of the bot **(don't do it without the creator permission!)**",
                            })
                            .setTimestamp()
                            .setThumbnail(
                                "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                            )
                            .setAuthor(
                                "Ace",
                                "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                            )
                            .setFooter(
                                "Copyright © 2020-2021 by Captain Ratax",
                                "https://cdn.discordapp.com/avatars/759404636888498186/f681536480ac91f285501bfe3e260c7b.png"
                            );
                        user.send({
                            embeds: [adminEmbed],
                        });
                    });
                    warnLogger.warn(
                        message.author.username +
                        " added the user " +
                        adminToAddName +
                        " with the id " +
                        adminToAddId +
                        " as admin!"
                    );
                    return;
                } else {
                    return message.reply({
                        content: "That user is already my administrator",
                    });
                }
            }
            return message.reply({
                content: "Sorry I don't recognize that command, but if you want type \"" +
                    prefix +
                    'help commands" to see what I can do.',
            });
        } catch (error) {
            errorLogger.error("Error on  command add admin. Errors:", error);
            message.channel.send(
                "Aconteceu algo de errado ao tentar executar esse comando..."
            );
        }
    },
    async removeCommand(args, message, client, prefix, currentBotDiscordId) {
        let checkAdmin = await BotAdmin.find({
            userId: message.author.id,
        });
        let isBotAdmin;
        if (!checkAdmin.length || checkAdmin.length === 0) {
            isBotAdmin = message.author.id === process.env.ACE_BOT_CREATOR_DISCORD_ID;
        } else {
            isBotAdmin = true;
        }
        if (!isBotAdmin) {
            return message.reply({
                content: "Sorry I don't recognize that command, but if you want type \"" +
                    prefix +
                    'help commands" to see what I can do.',
            });
        }
        if (!args[1]) {
            return message.reply({
                content: 'Did you mean "' + prefix + 'remove admin"?',
            }); //Send a warning message to the user
        }
        if (args[1] === "admin") {
            if (!args[2] ||
                args[2].substr(0, 2) !== "<@" ||
                args[2].charAt(args[2].length - 1) !== ">"
            ) {
                return message.reply({
                    content: 'You need to mention who you want to remove as administrator. For example: "' +
                        prefix +
                        "remove admin <@" +
                        currentBotDiscordId +
                        '>"',
                }); //Send a warning message to the user
            }
            let adminToRemoveId = args[2].substr(3, args[2].length - 4);
            let verifyUser = await BotAdmin.find({
                userId: adminToRemoveId,
            });
            if (!verifyUser.length || verifyUser.length === 0) {
                return message.channel.send({
                    content: "<@!" + adminToRemoveId + "> isn't my administrator",
                });
            } else {
                await BotAdmin.deleteMany({
                    userId: adminToRemoveId,
                });
                let userToRemoveName = client.users.cache.find(
                    (user) => user.id === adminToRemoveId
                ).username;
                warnLogger.warn(
                    message.author.username +
                    " removed the user " +
                    userToRemoveName +
                    " with the Id " +
                    adminToRemoveId +
                    " from admin!"
                );
                return message.reply({
                    content: "<@!" + adminToRemoveId + "> is no longer my administrator now",
                });
            }
        }
        return message.reply({
            content: "Sorry I don't recognize that command, but if you want type \"" +
                prefix +
                'help commands" to see what I can do.',
        });
    },
};