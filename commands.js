var lastPing, pingCounter; //For ping and pong reasons xD
var lastDeleteMessageId = 0;
const { errorLogger, infoLogger, warnLogger } = require("./logger"); //Import all the custom loggers
const { Prefix } = require("./models/prefixSchema");
const { BotConfigsLog } = require("./models/botConfigsLogSchema");
const { BotConfigs } = require("./models/botConfigsSchema");
const { BotAdmin } = require("./models/botAdminsSchema");
const sendPaginatedEmbed = require("./custom_discordjs-button-pagination");
const {
	ChannelType,
	PermissionsBitField,
	EmbedBuilder,
	ActivityType,
} = require("discord.js");

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
				"Something wrong happened when trying to execute that command..."
			);
		}
	},
	async delete(args, message, prefix, del_command_timeouts, client) {
		try {
			if (args[0] === "del") {
				args[2] = args[1];
			}
			if (args[1] !== "messages" && args[0] !== "del") {
				//args[1] is the second word from the command
				return message.reply({
					content: 'Did you mean "' + prefix + 'delete messages"?',
				}); //Send a warning message to the user
			}
			if (
				!message.member.permissions.has(
					PermissionsBitField.Flags.Administrator
				) &&
				!message.member
					.permissionsIn(message.channel)
					.has(PermissionsBitField.Flags.ManageMessages)
			) {
				return message.reply({
					content:
						"Only users with the manage messages permission can delete messages!",
				});
			}
			//Only proceed to the deletion of the messages if the user is an admin
			if (
				!message.guild.members.cache
					.get(client.user.id)
					.permissions.has(PermissionsBitField.Flags.Administrator) &&
				!message.guild.members.cache
					.get(client.user.id)
					.permissionsIn(message.channel)
					.has(PermissionsBitField.Flags.ManageMessages)
			) {
				return message.reply({
					content: "I don't have permission to delete messages!",
				});
			}
			if (!args[2] || !Number.isInteger(parseInt(args[2], 10))) {
				//Verify if the third "word" from the command is a number
				return message.reply({
					content:
						'Type the number of messages you want to delete, for example "' +
						prefix +
						'delete messages 2"',
				}); //Send a warning message to the user
			}
			args[2] = parseInt(args[2], 10);
			//args[2] is the number of messages the user wants to delete
			if (parseInt(args[2], 10) > 99) {
				return message.reply({
					content: "You can only delete 99 messages!",
				});
			}
			if (parseInt(args[2], 10) < 0) {
				return message.reply({
					content:
						"Think a little bit of what you asked me to do... Did you really thought you could delete negative messages? Pff humans...",
				});
			}
			if (parseInt(args[2], 10) === 0) {
				return message.reply({
					content: "Nothing deleted! Because you know... 0 is nothing human...",
				});
			}
			let currentDate = new Date();

			async function executeDelete() {
				let auxArray = await message.channel.messages.fetch({ limit: 2 });
				let isReadyForNewDelete = true;

				await auxArray.forEach((currMessage) => {
					if (isReadyForNewDelete) {
						isReadyForNewDelete = currMessage.id !== lastDeleteMessageId;
					}
				});

				if (!isReadyForNewDelete) {
					return message.reply({
						content:
							"Chill out! Wait a little bit before sending another delete command...",
					});
				}

				let n = args[2];
				n++;
				let msgsDeletedObj = await message.channel.bulkDelete(n, true); //Delete the number of messages requested by the user
				let msgsDeleted = msgsDeletedObj.size - 1;
				try {
					if (msgsDeleted === 1) {
						return message.channel
							.send({
								content: msgsDeleted + " message has been deleted!",
							})
							.then((message) => {
								lastDeleteMessageId = message.id;
								setTimeout(() => message.delete(), 3000); //Delete the success message after 5 seconds
							});
					} else {
						if (msgsDeleted <= 0) {
							return message.channel
								.send({
									content:
										"No messages have been deleted, probably because the messages are older than 14 days.",
								})
								.then((message) => {
									lastDeleteMessageId = message.id;
									setTimeout(() => message.delete(), 3000); //Delete the success message after 5 seconds
								});
						} else {
							return message.channel
								.send({
									content: msgsDeleted + " messages have been deleted!",
								})
								.then((message) => {
									lastDeleteMessageId = message.id;
									setTimeout(() => message.delete(), 3000);
								});
						}
					}
				} catch (err) {
					errorLogger.error("Error on delete command. Errors:", err);
					message.channel.send(
						"Something wrong happened when trying to execute that command..."
					);
				}
			}

			if (!del_command_timeouts[message.channel.id]) {
				del_command_timeouts[message.channel.id] = {
					date: currentDate,
					AlreadyMessaged: false,
				};
				executeDelete();
			} else {
				let timeSpent =
					currentDate.getTime() - del_command_timeouts[message.channel.id].date;
				if (timeSpent > 5000) {
					del_command_timeouts[message.channel.id].date = currentDate;
					executeDelete();
				} else {
					del_command_timeouts[message.channel.id].date = currentDate;
					let auxTimeLeft = Math.floor((5000 - timeSpent) / 1000);
					return message.reply({
						content:
							"You need to wait 5 seconds before using the delete command on this channel again. " +
							auxTimeLeft +
							" seconds left",
					});
				}
			}
		} catch (error) {
			errorLogger.error("Error on delete command. Errors:", error);
			message.channel.send(
				"Something wrong happened when trying to execute that command..."
			);
		}
	},
	help(args, message, prefix, botName, currentYear) {
		try {
			if (!args[1] && args[0] !== "hc") {
				const helpEmbed = new EmbedBuilder()
					.setColor("#66ccff")
					.setTitle(botName + " Help Menu")
					.addFields(
						{
							name: "Commands List",
							value: prefix + "help commands",
						},
						{
							name: "\u200B",
							value: "\u200B",
						},
						{
							name: "See my code on GitHub!",
							value: "https://github.com/Ratot-Team/Ratot",
						}
					)
					.setTimestamp()
					.setThumbnail(
						"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512"
					)
					.setAuthor({
						name: botName,
						iconURL:
							"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
						url: "https://github.com/Ratot-Team/Ratot",
					})
					.setFooter({
						text: "Copyright © 2020-" + currentYear + " by Captain Ratax",
						iconURL:
							"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
					}); //Create a personalized embed message
				message.reply({
					embeds: [helpEmbed],
				}); //Send that embed message
			} else {
				try {
					if (args[1] !== "commands" && args[0] !== "hc") {
						return message.reply({
							content:
								"Sorry I don't recognize that command, but if you want type \"" +
								prefix +
								'help commands" to see what I can do.',
						});
					}
					const helpCommandsEmbed = new EmbedBuilder()
						.setColor("#66ccff")
						.setTitle("Commands List")
						.addFields(
							{
								name: prefix + "ping",
								value:
									'The bot responds with "pong", but to know your ping you really have to insist a little bit',
							},
							{
								name: prefix + "delete messages <number>",
								value:
									"The bot deletes a certain number of messages. Only admins can use this command.",
							},
							{
								name: prefix + "hug <@someone>",
								value:
									"The bot gives a hug to someone you mention. You can mention yourself don't be shy!",
							},
							{
								name: prefix + "bot ping",
								value: "Says the ping value of the bot",
							},
							{
								name: prefix + "my ping",
								value:
									"Say the value of your ping (kind of... is a little bit complicated xD)",
							},
							{
								name: prefix + "prefix <prefix>",
								value: "Change the prefix for the bot commands",
							}
						)
						.setTimestamp()
						.setThumbnail(
							"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512"
						)
						.setAuthor({
							name: botName,
							iconURL:
								"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
							url: "https://github.com/Ratot-Team/Ratot",
						})
						.setFooter({
							text: "Copyright © 2020-" + currentYear + " by Captain Ratax",
							iconURL:
								"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
						});
					message.reply({
						embeds: [helpCommandsEmbed],
					});
				} catch (error) {
					errorLogger.error(
						"Error on help list of commands command. Errors:",
						error
					);
					message.channel.send(
						"Something wrong happened when trying to execute that command..."
					);
				}
			}
		} catch (error) {
			errorLogger.error("Error on help command. Errors:", error);
			message.channel.send(
				"Something wrong happened when trying to execute that command..."
			);
		}
	},
	hug(args, message, prefix, currentBotDiscordId, client) {
		try {
			var userToHugId = "";
			try {
				userToHugId = args[1].match(/\d/g);
				userToHugId = userToHugId.join("");
				let tempUserName = client.users.cache.find(
					(user) => user.id === userToHugId
				).username;
			} catch (err) {
				return message.reply({
					content:
						'Mention who you want me to hug, for example "' +
						prefix +
						"hug <@" +
						currentBotDiscordId +
						'>"',
				});
			}
			if (userToHugId === currentBotDiscordId) {
				//If the user mentioned the bot
				message.channel.send({
					content:
						"I hugged myself as requested by <@" + message.author.id + ">",
				});
			} else if (userToHugId === message.author.id) {
				//If the user mentioned himself
				message.reply({
					content: "I hugged you!",
				});
			} else {
				message.channel.send({
					content:
						"I hugged " +
						args[1] +
						" as requested by <@" +
						message.author.id +
						">",
				});
			}
		} catch (error) {
			errorLogger.error("Error on hug command. Errors:", error);
			message.channel.send(
				"Something wrong happened when trying to execute that command..."
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
				"Something wrong happened when trying to execute that command..."
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
				"Something wrong happened when trying to execute that command..."
			);
		}
	},
	async changePrefix(args, message, prefix) {
		try {
			if (
				!message.member.permissions.has(PermissionsBitField.Flags.Administrator)
			) {
				return message.reply({
					content:
						"Only users with admin permissions can change the bot prefix!",
				});
			}
			if (!args[1]) {
				return message.reply({
					content:
						'You need to specify the new prefix you want. Example: "' +
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
				await Prefix.findOneAndUpdate(
					{
						_id: prefixes[0]._id,
					},
					prefixes[0],
					{
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
				"Something wrong happened when trying to execute that command..."
			);
		}
	},
	async changeBotSettings(args, message, client, prefix, currentYear, botName) {
		try {
			let checkAdmin = await BotAdmin.find({
				userId: message.author.id,
			});
			let isBotAdmin;
			if (!checkAdmin.length || checkAdmin.length === 0) {
				isBotAdmin = message.author.id === process.env.RATOT_CREATOR_DISCORD_ID;
			} else {
				isBotAdmin = true;
			}
			if (!isBotAdmin) {
				return;
			} else {
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
						const statusEmbed = new EmbedBuilder()
							.setColor("#66ccff")
							.setTitle("You need to specify the type of status you want!")
							.addFields(
								{
									name:
										'For example: "' + prefix + 'change status **3** <status>"',
									value: "**The list of possible status is:**",
								},
								{
									name: "1",
									value: "Playing",
								},
								{
									name: "2",
									value: "Listening to",
								},
								{
									name: "3",
									value: "Watching",
								},
								{
									name: "4",
									value: "Competing in",
								}
							)
							.setTimestamp()
							.setThumbnail(
								"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512"
							)
							.setAuthor({
								name: botName,
								iconURL:
									"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
								url: "https://github.com/Ratot-Team/Ratot",
							})
							.setFooter({
								text: "Copyright © 2020-" + currentYear + " by Captain Ratax",
								iconURL:
									"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
							});
						return message.reply({
							embeds: [statusEmbed],
						}); //Send a warning message to the user
					}
					if (!args[3]) {
						return message.reply({
							content:
								'You need to specified the new status you want! For example: "' +
								prefix +
								"change status " +
								args[2] +
								' **This will be the new status**"',
						}); //Send a warning message to the user
					}
					if (args[3].length > 128) {
						return message.reply({
							content:
								"Status can't have more than 128 characters. You wrote a status with " +
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
					let auxTypesNames = ["PLAYING", "LISTENING", "WATCHING", "COMPETING"];
					let auxTypes = [
						ActivityType.Playing,
						ActivityType.Listening,
						ActivityType.Watching,
						ActivityType.Competing,
					];
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
							"Something wrong happened when trying to execute that command..."
						);
					}
					warnLogger.warn(
						"Bot status changed by " +
							message.author.username +
							" to " +
							auxTypesNames[auxTypeNumber] +
							" " +
							auxStatus
					);
					let checkConfigs = await BotConfigs.find({
						config: "Status",
					});
					let previousStatus,
						previousType = "";
					if (!checkConfigs.length || checkConfigs.length === 0) {
						let changedBotConfigs = await new BotConfigs({
							config: "Status",
							value: auxStatus,
							value2: auxTypesNames[auxTypeNumber],
							value3: null,
							valueInt: auxTypes[auxTypeNumber],
							valueInt2: null,
							valueInt3: null,
							lastModifiedBy: message.author.id,
						});
						await changedBotConfigs.save();
					} else {
						previousStatus = checkConfigs[0].value;
						previousType = checkConfigs[0].value2;
						checkConfigs[0].value = auxStatus;
						checkConfigs[0].value2 = auxTypesNames[auxTypeNumber];
						checkConfigs[0].value3 = null;
						checkConfigs[0].valueInt = auxTypes[auxTypeNumber];
						checkConfigs[0].valueInt2 = null;
						checkConfigs[0].valueInt3 = null;
						checkConfigs[0].lastModifiedBy = message.author.id;
						await BotConfigs.findOneAndUpdate(
							{
								_id: checkConfigs[0]._id,
							},
							checkConfigs[0],
							{
								new: true,
								useFindAndModify: false,
							}
						);
					}
					let changedBotConfigsLog = new BotConfigsLog({
						changed: "Status",
						changedFrom: previousStatus,
						changedFrom2: previousType,
						changedFrom3: null,
						changedTo: auxStatus,
						changedTo2: auxTypesNames[auxTypeNumber],
						changedTo3: null,
						changedBy: message.author.username,
						changedById: message.author.id,
					});
					await changedBotConfigsLog.save();
					return message.reply({
						content: "Status successfully changed!",
					});
				}
			}
			return;
		} catch (error) {
			errorLogger.error(
				"Error on  command change bot settings. Errors:",
				error
			);
			message.channel.send(
				"Something wrong happened when trying to execute that command..."
			);
		}
	},
	async addCommand(
		args,
		message,
		client,
		prefix,
		currentBotDiscordId,
		currentYear,
		botName
	) {
		try {
			let checkAdmin = await BotAdmin.find({
				userId: message.author.id,
			});
			let isBotAdmin;
			if (!checkAdmin.length || checkAdmin.length === 0) {
				isBotAdmin = message.author.id === process.env.RATOT_CREATOR_DISCORD_ID;
			} else {
				isBotAdmin = true;
			}
			if (!isBotAdmin) {
				return;
			} else {
				if (!args[1]) {
					return message.reply({
						content: 'Did you mean "' + prefix + 'add admin"?',
					}); //Send a warning message to the user
				}
				if (args[1] === "admin") {
					var adminToAddId = "";
					var adminToAddName = "";
					try {
						adminToAddId = args[2].match(/\d/g);
						adminToAddId = adminToAddId.join("");
						adminToAddName = client.users.cache.find(
							(user) => user.id === adminToAddId
						).username;
					} catch (err) {
						return message.reply({
							content:
								'You need to mention who you want to add as admin, or write is ID. For example: "' +
								prefix +
								"add admin <@" +
								currentBotDiscordId +
								'>" or "$add admin ' +
								currentBotDiscordId +
								'"',
						}); //Send a warning message to the user
					}
					if (adminToAddId === currentBotDiscordId) {
						return message.reply({
							content: "I cannot be my own administrator",
						}); //Send a warning message to the user
					}
					let verifyUser = await BotAdmin.find({
						userId: adminToAddId,
					});
					if (!verifyUser.length || verifyUser.length === 0) {
						let newAdmin = new BotAdmin({
							userId: adminToAddId,
							userName: adminToAddName,
							createdBy: message.author.username,
							createdById: message.author.id,
						});
						newAdmin.save();
						message.reply({
							content: "<@" + adminToAddId + "> is now an administrator!",
						});
						warnLogger.warn(
							message.author.username +
								" added the user " +
								adminToAddName +
								" with the id " +
								adminToAddId +
								" as admin!"
						);
						try {
							client.users.fetch(adminToAddId, false).then((user) => {
								const adminEmbed = new EmbedBuilder()
									.setColor("#66ccff")
									.setTitle(
										" Now you are an administrator of the " + botName + " Bot!"
									)
									.setDescription("Here is some commands you can do now:")
									.addFields(
										{
											name: "$change status <number of status> <status> (or $cs <number of status> <status>)",
											value: "Change the status message of the bot",
										},
										{
											name: "$add admin <@someone>",
											value:
												"Add a new administrator to the bot __**(don't do it without the creator permission!)**__",
										},
										{
											name: "$remove admin <@someone>",
											value:
												"Remove an administrator of the bot __**(don't do it without the creator permission!)**__",
										},
										{
											name: "$list servers (or $ls)",
											value: "Lists all the servers the bot is on",
										},
										{
											name: "$list channels <optionalServerId> (or $lc <optionalServerId>)",
											value:
												"Lists all the channels from the server where the message is sent, or if given an id from a server lists all the channels from that server",
										}
									)
									.setTimestamp()
									.setThumbnail(
										"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512"
									)
									.setAuthor({
										name: botName,
										iconURL:
											"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
										url: "https://github.com/Ratot-Team/Ratot",
									})
									.setFooter({
										text:
											"Copyright © 2020-" + currentYear + " by Captain Ratax",
										iconURL:
											"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
									});
								try {
									user
										.send({
											embeds: [adminEmbed],
										})
										.catch(() =>
											message.reply({
												content:
													"It wasn't possible to send private message to the user with the admin informations.",
											})
										);
								} catch (err) {
									errorLogger.error(
										"An error as occurred when trying to send private message to user. Error:",
										error
									);
								}
							});
						} catch (error) {
							errorLogger.error(
								"An error as occurred when trying to send private message to user. Error:",
								error
							);
							return message.reply({
								content:
									"It wasn't possible to send private message to the user with the admin informations.",
							});
						}
						return;
					} else {
						return message.reply({
							content: "That user is already my administrator",
						});
					}
				}
			}
			return;
		} catch (error) {
			errorLogger.error("Error on  command add admin. Errors:", error);
			message.channel.send(
				"Something wrong happened when trying to execute that command..."
			);
		}
	},
	async removeCommand(args, message, client, prefix, currentBotDiscordId) {
		let checkAdmin = await BotAdmin.find({
			userId: message.author.id,
		});
		let isBotAdmin;
		if (!checkAdmin.length || checkAdmin.length === 0) {
			isBotAdmin = message.author.id === process.env.RATOT_CREATOR_DISCORD_ID;
		} else {
			isBotAdmin = true;
		}
		if (!isBotAdmin) {
			return;
		} else {
			if (!args[1]) {
				return message.reply({
					content: 'Did you mean "' + prefix + 'remove admin"?',
				}); //Send a warning message to the user
			}
			if (args[1] === "admin") {
				var adminToRemoveId = "";
				var adminToRemoveName = "";
				try {
					adminToRemoveId = args[2].match(/\d/g);
					adminToRemoveId = adminToRemoveId.join("");
					adminToRemoveName = client.users.cache.find(
						(user) => user.id === adminToRemoveId
					).username;
				} catch (err) {
					return message.reply({
						content:
							'You need to mention who you want to remove as admin, or write is ID. For example: "' +
							prefix +
							"remove admin <@" +
							currentBotDiscordId +
							'>" or "$remove admin ' +
							currentBotDiscordId +
							'"',
					}); //Send a warning message to the user
				}
				if (adminToRemoveId === currentBotDiscordId) {
					return message.reply({
						content: "I cannot be my own administrator",
					}); //Send a warning message to the user
				}
				let verifyUser = await BotAdmin.find({
					userId: adminToRemoveId,
				});
				if (!verifyUser.length || verifyUser.length === 0) {
					return message.channel.send({
						content: "<@" + adminToRemoveId + "> isn't my administrator",
					});
				} else {
					await BotAdmin.deleteMany({
						userId: adminToRemoveId,
					});
					warnLogger.warn(
						message.author.username +
							" removed the user " +
							adminToRemoveName +
							" with the Id " +
							adminToRemoveId +
							" from admin!"
					);
					return message.reply({
						content:
							"<@" + adminToRemoveId + "> is no longer my administrator now",
					});
				}
			}
		}
		return;
	},
	async list(args, message, client, prefix, currentYear, botName) {
		let checkAdmin = await BotAdmin.find({
			userId: message.author.id,
		});
		let isBotAdmin;
		if (!checkAdmin.length || checkAdmin.length === 0) {
			isBotAdmin = message.author.id === process.env.RATOT_CREATOR_DISCORD_ID;
		} else {
			isBotAdmin = true;
		}
		if (isBotAdmin) {
			if (!args[1] && args[0] !== "ls" && args[0] !== "lc") {
				return message.reply({
					content:
						'Did you mean "' +
						prefix +
						'list servers" or "' +
						prefix +
						'list channels <optionalServerId>"?',
				}); //Send a warning message to the user
			}
			if (args[0] === "lc") {
				args.splice(1, 0, "channels");
			}
			var i = 0;
			var j = 0;
			var tempEmbed = new EmbedBuilder()
				.setColor("#66ccff")
				.setTitle("Channels List")
				.setTimestamp()
				.setAuthor({
					name: botName,
					iconURL:
						"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
					url: "https://github.com/Ratot-Team/Ratot",
				})
				.setFooter({
					text: "Copyright © 2020-" + currentYear + " by Captain Ratax",
					iconURL:
						"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
				});
			var embeds = [];
			if (args[1] === "servers" || args[0] === "ls") {
				await client.guilds.cache.forEach((guild) => {
					i++;
					if (i % 5 === 0 || i === client.guilds.cache.size) {
						tempEmbed.addFields({ name: guild.name, value: guild.id });
						embeds[j] = tempEmbed;
						tempEmbed = new EmbedBuilder()
							.setColor("#66ccff")
							.setTitle("Servers List")
							.setTimestamp()
							.setAuthor({
								name: botName,
								iconURL:
									"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
								url: "https://github.com/Ratot-Team/Ratot",
							})
							.setFooter({
								text: "Copyright © 2020-" + currentYear + " by Captain Ratax",
								iconURL:
									"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
							});
						j++;
					} else {
						tempEmbed.addFields({ name: guild.name, value: guild.id });
					}
				});

				if (client.guilds.cache.size <= 5) {
					return message.channel.send({ embeds });
				} else {
					const timeout = 60000;

					return sendPaginatedEmbed(
						message.channel,
						embeds,
						message.author.id,
						timeout,
						currentYear
					);
				}
			}
			if (args[1] === "channels" || args[0] === "lc") {
				if (!args[2]) {
					await message.guild.channels.cache.forEach((channel) => {
						i++;
						if (i % 5 === 0 || i === message.guild.channels.cache.size) {
							tempEmbed.addFields({
								name: channel.name + " (" + ChannelType[channel.type] + ")",
								value: channel.id,
							});
							embeds[j] = tempEmbed;
							tempEmbed = new EmbedBuilder()
								.setColor("#66ccff")
								.setTitle("Channels List")
								.setTimestamp()
								.setAuthor({
									name: botName,
									iconURL:
										"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
									url: "https://github.com/Ratot-Team/Ratot",
								})
								.setFooter({
									text: "Copyright © 2020-" + currentYear + " by Captain Ratax",
									iconURL:
										"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
								});
							j++;
						} else {
							tempEmbed.addFields({
								name: channel.name + " (" + ChannelType[channel.type] + ")",
								value: channel.id,
							});
						}
					});

					if (message.guild.channels.cache.size <= 5) {
						return message.channel.send({ embeds });
					} else {
						const timeout = 60000;

						return sendPaginatedEmbed(
							message.channel,
							embeds,
							message.author.id,
							timeout,
							currentYear
						);
					}
				} else {
					let isIdValid;
					await client.guilds.cache.forEach((guild) => {
						if (!isIdValid) {
							isIdValid = args[2] === guild.id;
						}
					});
					if (isIdValid) {
						var channelsCount = await client.guilds.cache.get(args[2]).channels
							.cache.size;
						await client.guilds.cache
							.get(args[2])
							.channels.cache.forEach((channel) => {
								i++;
								if (i % 5 === 0 || i === channelsCount) {
									tempEmbed.addFields({
										name: channel.name + " (" + ChannelType[channel.type] + ")",
										value: channel.id,
									});
									embeds[j] = tempEmbed;
									tempEmbed = new EmbedBuilder()
										.setColor("#66ccff")
										.setTitle("Channels List")
										.setTimestamp()
										.setAuthor({
											name: botName,
											iconURL:
												"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
											url: "https://github.com/Ratot-Team/Ratot",
										})
										.setFooter({
											text:
												"Copyright © 2020-" + currentYear + " by Captain Ratax",
											iconURL:
												"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
										});
									j++;
								} else {
									tempEmbed.addFields({
										name: channel.name + " (" + ChannelType[channel.type] + ")",
										value: channel.id,
									});
								}
							});

						if (channelsCount <= 5) {
							return message.channel.send({ embeds });
						} else {
							const timeout = 60000;

							return sendPaginatedEmbed(
								message.channel,
								embeds,
								message.author.id,
								timeout,
								currentYear
							);
						}
					} else {
						return message.reply("The id provided is not from a valid server.");
					}
				}
			}
		} else {
			return;
		}
	},
};
