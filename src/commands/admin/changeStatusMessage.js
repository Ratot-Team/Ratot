require("dotenv").config();
var {
	ApplicationCommandOptionType,
	EmbedBuilder,
	ActivityType,
} = require("discord.js");

const { errorLogger, warnLogger } = require("../../utils/logger");
const { BotAdmin } = require("../../../models/botAdminsSchema");
const { BotConfigs } = require("../../../models/botConfigsSchema");
const { BotConfigsLog } = require("../../../models/botConfigsLogSchema");

module.exports = {
	name: "change-status",
	description: "Change the status message of the bot",
	options: [
		{
			name: "number-of-status",
			description:
				"Number of the status you want to change (if you don't know the nubmer write 0)",
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
		{
			name: "status-message",
			description: "The new status message",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	botAdminOnly: true,
	// permissionsRequired: [PermissionFlagsBits.ManageMessages],
	// botPermissions: [PermissionFlagsBits.ManageMessages],
	// deleted: true,
	callback: async (client, interaction) => {
		const numberOfStatus = interaction.options.getInteger("number-of-status");
		const positionOfStatus = numberOfStatus - 1;
		const statusMessage = interaction.options.getString("status-message");

		try {
			let checkAdmin = await BotAdmin.find({
				userId: interaction.member.user.id,
			});
			let isBotAdmin;
			if (!checkAdmin.length || checkAdmin.length === 0) {
				isBotAdmin =
					interaction.member.user.id === process.env.RATOT_CREATOR_DISCORD_ID;
			} else {
				isBotAdmin = true;
			}
			if (!isBotAdmin) {
				return interaction.reply({
					content: "Only bot admins can use this command!",
					ephemeral: true,
				});
			} else {
				if (numberOfStatus < 1 || numberOfStatus > 4) {
					let currentYear = new Date().getFullYear();
					const statusEmbed = new EmbedBuilder()
						.setColor("#66ccff")
						.setTitle("You need to specify the type of status you want!")
						.addFields(
							{
								name: "**The list of possible status is:**",
								value: " ",
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
							name: process.env.RATOT_CURRENT_NAME,
							iconURL:
								"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
							url: "https://github.com/Ratot-Team/Ratot",
						})
						.setFooter({
							text: "Copyright © 2020-" + currentYear + " by Captain Ratax",
							iconURL:
								"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
						});
					return interaction.reply({
						embeds: [statusEmbed],
						ephemeral: true,
					}); //Send a warning message to the user
				}
				if (statusMessage.length > 128) {
					return interaction.reply({
						content:
							"Status can't have more than 128 characters. You wrote a status with " +
							statusMessage.length +
							" characters.",
						ephemeral: true,
					});
				}

				let auxTypesNames = ["PLAYING", "LISTENING", "WATCHING", "COMPETING"];
				let auxTypes = [
					ActivityType.Playing,
					ActivityType.Listening,
					ActivityType.Watching,
					ActivityType.Competing,
				];

				try {
					await client.user.setActivity(statusMessage, {
						type: auxTypes[positionOfStatus],
					});
				} catch (err) {
					errorLogger.error(
						"Error on  command change bot settings. Errors:",
						err
					);
					interaction.reply({
						content:
							"Something wrong happened when trying to execute that command...",
						ephemeral: true,
					});
				}
				warnLogger.warn(
					"Bot status changed by " +
						interaction.member.user.username +
						" to " +
						auxTypesNames[positionOfStatus] +
						" " +
						statusMessage
				);
				let checkConfigs = await BotConfigs.find({
					config: "Status",
				});
				let previousStatus,
					previousType = "";
				if (!checkConfigs.length || checkConfigs.length === 0) {
					let changedBotConfigs = await new BotConfigs({
						config: "Status",
						value: statusMessage,
						value2: auxTypesNames[positionOfStatus],
						value3: null,
						valueInt: auxTypes[positionOfStatus],
						valueInt2: null,
						valueInt3: null,
						lastModifiedBy: interaction.member.user.id,
					});
					await changedBotConfigs.save();
				} else {
					previousStatus = checkConfigs[0].value;
					previousType = checkConfigs[0].value2;
					checkConfigs[0].value = statusMessage;
					checkConfigs[0].value2 = auxTypesNames[positionOfStatus];
					checkConfigs[0].value3 = null;
					checkConfigs[0].valueInt = auxTypes[positionOfStatus];
					checkConfigs[0].valueInt2 = null;
					checkConfigs[0].valueInt3 = null;
					checkConfigs[0].lastModifiedBy = interaction.member.user.id;
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
					changedTo: statusMessage,
					changedTo2: auxTypesNames[positionOfStatus],
					changedTo3: null,
					changedBy: interaction.member.user.username,
					changedById: interaction.member.user.id,
				});
				await changedBotConfigsLog.save();
				return interaction.reply({
					content: "Status successfully changed!",
				});
			}
		} catch (error) {
			errorLogger.error(
				"Error on  command change bot settings. Errors:",
				error
			);
			interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				ephemeral: true,
			});
		}
	},
};
