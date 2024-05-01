const {
	ActionRowBuilder,
	ButtonBuilder,
	ComponentType,
} = require("discord.js");

const sendPaginatedEmbed = async (
	originalInteraction,
	embeds,
	userId,
	timeout,
	currentYear,
	anonym
) => {
	let page = 0;

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("previous")
			.setLabel("Previous")
			.setStyle("Primary"),
		new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle("Primary")
	);

	embeds[page].setFooter({
		text:
			"Copyright © 2020-" +
			currentYear +
			" by Captain Ratax" +
			" | Page 1 of " +
			embeds.length,
		iconURL:
			"https://cdn.discordapp.com/avatars/759404636888498186/7767a8b3aae66dc5198ca89f7fc16173.png?size=512",
	});

	const message = await originalInteraction.reply({
		embeds: [embeds[page]],
		components: [row],
		ephemeral: anonym,
	});

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: timeout,
	});

	collector.on("collect", async (interaction) => {
		if (interaction.user.id !== userId) {
			return interaction.reply({
				content: "You are not allowed to use this button!",
				ephemeral: true,
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
				"Copyright © 2020-" +
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

	collector.on("end", () => {
		message.edit({ components: [] });
	});
};

module.exports = sendPaginatedEmbed;
