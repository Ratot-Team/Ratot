// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

var {
	ApplicationCommandOptionType,
	EmbedBuilder,
	ActivityType,
	MessageFlags,
} = require("discord.js");

const { errorLogger, warnLogger } = require("../../utils/logger");
const { getConfig } = require("../../config");
const { isAdmin } = require("../../repositories/admins");
const { changeStatus } = require("../../services/status");
const { safeDatabaseError } = require("../../db");

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
		{
			name: "anonym",
			description: "Only you can see the response",
			type: ApplicationCommandOptionType.Boolean,
			required: false,
		},
	],
	botAdminOnly: true,
	// permissionsRequired: [PermissionFlagsBits.ManageMessages],
	// botPermissions: [PermissionFlagsBits.ManageMessages],
	// deleted: true,
	callback: async (client, interaction) => {
		const numberOfStatus =
			interaction.options.getInteger("number-of-status");
		const positionOfStatus = numberOfStatus - 1;
		const statusMessage = interaction.options.getString("status-message");
		const anonym = interaction.options.getBoolean("anonym");

		try {
			const config = getConfig();
			const hasAdminRecord = await isAdmin(interaction.member.user.id);
			const isBotAdmin =
				hasAdminRecord || interaction.member.user.id === config.creator.id;
			if (!isBotAdmin) {
				return interaction.reply({
					content: "Only bot admins can use this command!",
					flags: MessageFlags.Ephemeral,
				});
			} else {
				if (numberOfStatus < 1 || numberOfStatus > 4) {
					let currentYear = new Date().getFullYear();
					const statusEmbed = new EmbedBuilder()
						.setColor("#66ccff")
						.setTitle(
							"You need to specify the type of status you want!",
						)
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
							},
						)
						.setTimestamp()
						.setThumbnail(
							"https://raw.githubusercontent.com/Ratot-Team/Ratot/main/assets/avatar_with_background_compressed.gif",
						)
						.setAuthor({
							name: config.discord.name,
							iconURL:
								"https://raw.githubusercontent.com/Ratot-Team/Ratot/main/assets/avatar_with_background_compressed.gif",
							url: "https://github.com/Ratot-Team/Ratot",
						})
						.setFooter({
							text:
								"Copyright © " +
								currentYear +
								" by Captain Ratax",
							iconURL:
								"https://raw.githubusercontent.com/Ratot-Team/Ratot/main/assets/avatar_with_background_compressed.gif",
						});
					return interaction.reply({
						embeds: [statusEmbed],
						flags: MessageFlags.Ephemeral,
					}); //Send a warning message to the user
				}
				if (statusMessage.length > 128) {
					return interaction.reply({
						content:
							"Status can't have more than 128 characters. You wrote a status with " +
							statusMessage.length +
							" characters.",
						flags: MessageFlags.Ephemeral,
					});
				}

				let auxTypesNames = [
					"PLAYING",
					"LISTENING",
					"WATCHING",
					"COMPETING",
				];
				let auxTypes = [
					ActivityType.Playing,
					ActivityType.Listening,
					ActivityType.Watching,
					ActivityType.Competing,
				];

				const { applied } = await changeStatus({
					client,
					activityType: auxTypes[positionOfStatus],
					value: statusMessage,
					value2: auxTypesNames[positionOfStatus],
					value3: null,
					lastModifiedBy: interaction.member.user.id,
					changedBy: interaction.member.user.username,
					changedById: interaction.member.user.id,
				});
				if (!applied) {
					errorLogger.error("Could not apply saved bot status to Discord");
					return interaction.reply({
						content: "Status saved, but Discord could not apply it immediately.",
						flags: MessageFlags.Ephemeral,
					});
				}
				warnLogger.warn(
					"Bot status changed by " +
						interaction.member.user.username +
						" to " +
						auxTypesNames[positionOfStatus] +
						" " +
						statusMessage,
				);
				return interaction.reply({
					content: "Status successfully changed!",
					flags: anonym ? MessageFlags.Ephemeral : undefined,
				});
			}
		} catch (error) {
			errorLogger.error(`Change status command failed: ${safeDatabaseError(error)}`);
			return interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
