// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

function idText(id) {
	if (typeof id === "number" && !Number.isSafeInteger(id)) {
		throw new TypeError("PostgreSQL id must be passed as a decimal string");
	}
	const value = String(id);
	if (!/^[1-9][0-9]*$/.test(value)) {
		throw new TypeError("PostgreSQL id must be a positive decimal string");
	}
	return value;
}

function page({ limit = 50, offset = 0 } = {}) {
	if (!Number.isInteger(limit) || limit < 1 || limit > 100 ||
		!Number.isSafeInteger(offset) || offset < 0) {
		throw new RangeError("Pagination requires limit 1..100 and nonnegative offset");
	}
	return { limit, offset };
}

function updateFields(patch, allowed) {
	const entries = Object.entries(patch);
	if (entries.length === 0 || entries.some(([key]) => !Object.hasOwn(allowed, key))) {
		throw new TypeError("Invalid update fields");
	}
	return {
		assignments: entries.map(([key], index) => `${allowed[key]} = $${index + 2}`),
		values: entries.map(([, value]) => value),
	};
}

module.exports = { idText, page, updateFields };
