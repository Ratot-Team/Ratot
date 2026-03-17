// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	MessageFlags,
} = require("discord.js");

const sendPaginatedEmbed = async (
	originalInteraction,
	embeds,
	userId,
	timeout,
	currentYear,
	anonym,
) => {
	let page = 0;

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("previous")
			.setLabel("Previous")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId("next")
			.setLabel("Next")
			.setStyle(ButtonStyle.Primary),
	);

	embeds[page].setFooter({
		text:
			"Copyright © " +
			currentYear +
			" by Captain Ratax" +
			" | Page 1 of " +
			embeds.length,
		iconURL:
			"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
	});

	await originalInteraction.reply({
		embeds: [embeds[page]],
		components: [row],
		flags: anonym ? MessageFlags.Ephemeral : undefined,
	});

	const message = await originalInteraction.fetchReply();

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: timeout,
	});

	collector.on("collect", async (interaction) => {
		if (interaction.user.id !== userId) {
			return interaction.reply({
				content: "You are not allowed to use this button!",
				flags: MessageFlags.Ephemeral,
			});
		}

		await interaction.deferUpdate();

		if (interaction.customId === "previous") {
			page = page > 0 ? --page : embeds.length - 1;
		} else if (interaction.customId === "next") {
			page = page + 1 < embeds.length ? ++page : 0;
		}

		embeds[page].setFooter({
			text:
				"Copyright © " +
				currentYear +
				" by Captain Ratax" +
				" | Page " +
				(page + 1) +
				" of " +
				embeds.length,
			iconURL:
				"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
		});

		await interaction.editReply({
			embeds: [embeds[page]],
			components: [row],
		});
	});

	collector.on("end", async () => {
		try {
			await originalInteraction.editReply({
				components: [],
			});
		} catch (error) {
			// Ignore errors if the message no longer exists or cannot be edited
		}
	});
};

module.exports = sendPaginatedEmbed;
