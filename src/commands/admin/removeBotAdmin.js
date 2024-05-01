require("dotenv").config();
var { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

const { errorLogger, warnLogger } = require("../../utils/logger");
const { BotAdmin } = require("../../../models/botAdminsSchema");
const e = require("express");

module.exports = {
	name: "remove-bot-admin",
	description:
		"Remove an administrator of the bot (don't do it without the creator permission!)",
	options: [
		{
			name: "user",
			description: "The user you want to remove as a bot administrator",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
	],
	botAdminOnly: true,
	// permissionsRequired: [PermissionFlagsBits.ManageMessages],
	// botPermissions: [PermissionFlagsBits.ManageMessages],
	// deleted: true,
	callback: async (client, interaction) => {
		const userToRemove = interaction.options.getUser("user");

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
				if (userToRemove.id === process.env.RATOT_CURRENT_DISCORD_ID) {
					return interaction.reply({
						content: "I cannot be my own administrator",
						ephemeral: true,
					}); //Send a warning message to the user
				}
				let verifyUser = await BotAdmin.find({
					userId: userToRemove.id,
				});
				if (!verifyUser.length || verifyUser.length === 0) {
					return interaction.reply({
						content: "<@" + userToRemove.id + "> isn't my administrator",
						ephemeral: true,
					});
				} else {
					await BotAdmin.deleteMany({
						userId: userToRemove.id,
					});
					warnLogger.warn(
						interaction.member.user.username +
							" removed the user " +
							userToRemove.username +
							" with the Id " +
							userToRemove.id +
							" from admin!"
					);
					return interaction.reply({
						content:
							"<@" + userToRemove.id + "> is no longer my administrator now",
					});
				}
			}
		} catch (error) {
			errorLogger.error("Error on  command remove admin. Errors:", error);
			interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				ephemeral: true,
			});
		}
	},
};
