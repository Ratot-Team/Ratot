require("dotenv").config();
var { EmbedBuilder } = require("discord.js");

const { errorLogger } = require("../../utils/logger");
const { BotAdmin } = require("../../../models/botAdminsSchema");
const sendPaginatedEmbed = require("../../utils/custom_discordjs-button-pagination");

module.exports = {
	name: "list-servers",
	description: "Lists all the servers the bot is on",
	// options: Object[],
	botAdminOnly: true,
	// permissionsRequired: [PermissionFlagsBits.ManageMessages],
	// botPermissions: [PermissionFlagsBits.ManageMessages],
	// deleted: true,
	callback: async (client, interaction) => {
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
			if (isBotAdmin) {
				var i = 0;
				var j = 0;
				var currentYear = new Date().getFullYear();
				var tempEmbed = new EmbedBuilder()
					.setColor("#66ccff")
					.setTitle("Servers List")
					.setTimestamp()
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
				var embeds = [];
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
						j++;
					} else {
						tempEmbed.addFields({ name: guild.name, value: guild.id });
					}
				});

				if (client.guilds.cache.size <= 5) {
					return interaction.reply({ embeds });
				} else {
					const timeout = 60000;

					return sendPaginatedEmbed(
						interaction,
						embeds,
						interaction.member.user.id,
						timeout,
						currentYear
					);
				}
			} else {
				return interaction.reply({
					content: "Only bot admins can use this command!",
					ephemeral: true,
				});
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
