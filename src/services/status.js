// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { setStatusAndLog } = require("../repositories/configs");

let previousChange = Promise.resolve();

function changeStatus({ client, activityType, ...status }) {
	const run = async () => {
		const row = await setStatusAndLog(status);
		try {
			await client.user.setActivity(status.value, { type: activityType });
			return { row, applied: true };
		} catch {
			return { row, applied: false };
		}
	};

	// Keep the database commit and Discord activity in the same process order.
	// A failed change must not prevent later requests from entering the queue.
	const currentChange = previousChange.then(run, run);
	previousChange = currentChange.then(
		() => undefined,
		() => undefined,
	);
	return currentChange;
}

module.exports = { changeStatus };
