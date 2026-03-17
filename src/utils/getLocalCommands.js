// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const path = require("path");
const getAllFiles = require("../utils/getAllFiles");

module.exports = (exceptions = []) => {
	let localCommands = [];

	const commandCategories = getAllFiles(
		path.join(__dirname, "..", "commands"),
		true
	);

	for (const commandCategory of commandCategories) {
		const commandFiles = getAllFiles(commandCategory);

		for (const commandFile of commandFiles) {
			const commandObject = require(commandFile);

			if (exceptions.includes(commandObject.name)) {
				continue;
			}

			localCommands.push(commandObject);
		}
	}

	return localCommands;
};
