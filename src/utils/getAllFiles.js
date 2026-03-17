// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const fs = require("fs");
const path = require("path");

module.exports = (directory, foldersOnly = false) => {
	let fileNames = [];

	const files = fs.readdirSync(directory, { withFileTypes: true });

	for (const file of files) {
		const filePath = path.join(directory, file.name);

		if (foldersOnly) {
			if (file.isDirectory()) {
				fileNames.push(filePath);
			}
		} else {
			if (file.isFile()) {
				fileNames.push(filePath);
			}
		}
	}

	return fileNames;
};
