// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

require("dotenv").config();
var {
	ApplicationCommandOptionType,
	EmbedBuilder,
	ChannelType,
	MessageFlags,
} = require("discord.js");

const { errorLogger } = require("../../utils/logger");
const { BotAdmin } = require("../../../models/botAdminsSchema");
const sendPaginatedEmbed = require("../../utils/custom_discordjs-button-pagination");

module.exports = {
	name: "list-channels",
	description:
		"Lists all the channels from a given server ID or from the server where the message is sent.",
	options: [
		{
			name: "server-id",
			description: "The optional server ID to list the channels",
			type: ApplicationCommandOptionType.String,
			required: false,
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
		try {
			const anonym = interaction.options.getBoolean("anonym");
			const serverId = interaction.options.getString("server-id");

			let checkAdmin = await BotAdmin.find({
				userId: interaction.member.user.id,
			});
			let isBotAdmin;
			if (!checkAdmin.length || checkAdmin.length === 0) {
				isBotAdmin =
					interaction.member.user.id ===
					process.env.RATOT_CREATOR_DISCORD_ID;
			} else {
				isBotAdmin = true;
			}
			if (isBotAdmin) {
				var i = 0;
				var j = 0;
				var currentYear = new Date().getFullYear();
				var tempEmbed = new EmbedBuilder()
					.setColor("#66ccff")
					.setTitle("Channels List")
					.setTimestamp()
					.setAuthor({
						name: process.env.RATOT_CURRENT_NAME,
						iconURL:
							"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
						url: "https://github.com/Ratot-Team/Ratot",
					})
					.setFooter({
						text:
							"Copyright © " + currentYear + " by Captain Ratax",
						iconURL:
							"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
					});
				var embeds = [];
				if (!serverId) {
					await interaction.member.guild.channels.cache.forEach(
						(channel) => {
							i++;
							if (
								i % 5 === 0 ||
								i ===
									interaction.member.guild.channels.cache.size
							) {
								tempEmbed.addFields({
									name:
										channel.name +
										" (" +
										ChannelType[channel.type] +
										")",
									value: channel.id,
								});
								embeds[j] = tempEmbed;
								tempEmbed = new EmbedBuilder()
									.setColor("#66ccff")
									.setTitle("Channels List")
									.setTimestamp()
									.setAuthor({
										name: process.env.RATOT_CURRENT_NAME,
										iconURL:
											"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
										url: "https://github.com/Ratot-Team/Ratot",
									})
									.setFooter({
										text:
											"Copyright © " +
											currentYear +
											" by Captain Ratax",
										iconURL:
											"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
									});
								j++;
							} else {
								tempEmbed.addFields({
									name:
										channel.name +
										" (" +
										ChannelType[channel.type] +
										")",
									value: channel.id,
								});
							}
						},
					);

					if (interaction.member.guild.channels.cache.size <= 5) {
						return interaction.reply({
							embeds,
							flags: anonym ? MessageFlags.Ephemeral : undefined,
						});
					} else {
						const timeout = 60000;

						return sendPaginatedEmbed(
							interaction,
							embeds,
							interaction.member.user.id,
							timeout,
							currentYear,
							anonym,
						);
					}
				} else {
					let isIdValid;
					await client.guilds.cache.forEach((guild) => {
						if (!isIdValid) {
							isIdValid = serverId === guild.id;
						}
					});
					if (isIdValid) {
						var channelsCount =
							await client.guilds.cache.get(serverId).channels
								.cache.size;
						await client.guilds.cache
							.get(serverId)
							.channels.cache.forEach((channel) => {
								i++;
								if (i % 5 === 0 || i === channelsCount) {
									tempEmbed.addFields({
										name:
											channel.name +
											" (" +
											ChannelType[channel.type] +
											")",
										value: channel.id,
									});
									embeds[j] = tempEmbed;
									tempEmbed = new EmbedBuilder()
										.setColor("#66ccff")
										.setTitle("Channels List")
										.setTimestamp()
										.setAuthor({
											name: process.env
												.RATOT_CURRENT_NAME,
											iconURL:
												"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
											url: "https://github.com/Ratot-Team/Ratot",
										})
										.setFooter({
											text:
												"Copyright © " +
												currentYear +
												" by Captain Ratax",
											iconURL:
												"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
										});
									j++;
								} else {
									tempEmbed.addFields({
										name:
											channel.name +
											" (" +
											ChannelType[channel.type] +
											")",
										value: channel.id,
									});
								}
							});

						if (channelsCount <= 5) {
							return interaction.reply({
								embeds,
								flags: anonym
									? MessageFlags.Ephemeral
									: undefined,
							});
						} else {
							const timeout = 60000;

							return sendPaginatedEmbed(
								interaction,
								embeds,
								interaction.member.user.id,
								timeout,
								currentYear,
								anonym,
							);
						}
					} else {
						return interaction.reply({
							content:
								"The id provided is not from a valid server.",
							flags: MessageFlags.Ephemeral,
						});
					}
				}
			} else {
				return interaction.reply({
					content: "Only bot admins can use this command!",
					flags: MessageFlags.Ephemeral,
				});
			}
		} catch (error) {
			errorLogger.error("Error on  command remove admin. Errors:", error);
			interaction.reply({
				content:
					"Something wrong happened when trying to execute that command...",
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
