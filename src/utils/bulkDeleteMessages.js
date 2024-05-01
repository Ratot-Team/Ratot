const { errorLogger } = require("../utils/logger");
var lastDeleteMessageId = 0;

module.exports = async (interaction, messagesToDelete, anonym) => {
	let auxArray = await interaction.channel.messages.fetch({ limit: 2 });
	let isReadyForNewDelete = true;

	await auxArray.forEach((currMessage) => {
		if (isReadyForNewDelete) {
			isReadyForNewDelete = currMessage.id !== lastDeleteMessageId;
		}
	});

	if (!isReadyForNewDelete) {
		return interaction.reply({
			content:
				"Chill out! Wait a little bit before sending another delete command...",
			ephemeral: true,
		});
	}

	let n = messagesToDelete;
	n++;
	let msgsDeletedObj = await interaction.channel.bulkDelete(n, true); //Delete the number of messages requested by the user
	let msgsDeleted = msgsDeletedObj.size;
	try {
		if (msgsDeleted === 1) {
			return interaction
				.reply({
					content: msgsDeleted + " message has been deleted!",
					ephemeral: anonym,
				})
				.then((interaction) => {
					lastDeleteMessageId = interaction.id;
					if (!anonym) setTimeout(() => interaction.delete(), 6000); //Delete the success message after 10 seconds
				});
		} else {
			if (msgsDeleted <= 0) {
				return interaction
					.reply({
						content:
							"No messages have been deleted, probably because the messages are older than 14 days.",
						ephemeral: anonym,
					})
					.then((interaction) => {
						lastDeleteMessageId = interaction.id;
						if (!anonym) setTimeout(() => interaction.delete(), 6000); //Delete the success message after 10 seconds
					});
			} else {
				return interaction
					.reply({
						content: msgsDeleted + " messages have been deleted!",
						ephemeral: anonym,
					})
					.then((interaction) => {
						lastDeleteMessageId = interaction.id;
						if (!anonym) setTimeout(() => interaction.delete(), 6000); //Delete the success message after 10 seconds
					});
			}
		}
	} catch (err) {
		errorLogger.error("Error on bulkDeleteMessages.js. Errors:", err);
		interaction.reply({
			content:
				"Something wrong happened when trying to execute that command...",
			ephemeral: true,
		});
	}
};
