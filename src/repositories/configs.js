// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { getDatabase } = require("../db");
const { idText, page, updateFields } = require("./common");

const columns = "id::text AS id, mongo_id, config, value, value2, value3, last_modified_by, created_at, updated_at";

async function getConfigById(id) {
	const result = await getDatabase().query(
		`SELECT ${columns} FROM public.bot_configs WHERE id = $1::bigint`,
		[idText(id)],
	);
	return result.rows[0] || null;
}

async function getStatusConfig() {
	const result = await getDatabase().query(
		`SELECT ${columns} FROM public.bot_configs WHERE config = $1 ORDER BY id ASC LIMIT 1`,
		["Status"],
	);
	return result.rows[0] || null;
}

async function listConfigs({ config = null, ...options } = {}) {
	const { limit, offset } = page(options);
	const result = await getDatabase().query(
		`SELECT ${columns} FROM public.bot_configs
		 WHERE ($1::text IS NULL OR config = $1)
		 ORDER BY id ASC LIMIT $2 OFFSET $3`,
		[config, limit, offset],
	);
	return result.rows;
}

async function countConfigs(config = null) {
	const result = await getDatabase().query(
		"SELECT count(*)::text AS count FROM public.bot_configs WHERE ($1::text IS NULL OR config = $1)",
		[config],
	);
	return result.rows[0].count;
}

async function createConfig({ config = null, value = null, value2 = null, value3 = null, lastModifiedBy = null }) {
	const result = await getDatabase().query(
		`INSERT INTO public.bot_configs (config, value, value2, value3, last_modified_by)
		 VALUES ($1, $2, $3, $4, $5) RETURNING ${columns}`,
		[config, value, value2, value3, lastModifiedBy],
	);
	return result.rows[0];
}

async function updateConfigById(id, patch) {
	const { assignments, values } = updateFields(patch, {
		config: "config", value: "value", value2: "value2",
		value3: "value3", lastModifiedBy: "last_modified_by",
	});
	const result = await getDatabase().query(
		`UPDATE public.bot_configs SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
		 WHERE id = $1::bigint RETURNING ${columns}`,
		[idText(id), ...values],
	);
	return result.rows[0] || null;
}

async function deleteConfigById(id) {
	const result = await getDatabase().query("DELETE FROM public.bot_configs WHERE id = $1::bigint", [idText(id)]);
	return result.rowCount;
}

async function setStatusAndLog({ value, value2, value3 = null, lastModifiedBy, changedBy, changedById }) {
	if (typeof value !== "string" || value.length > 128 ||
		!["PLAYING", "LISTENING", "WATCHING", "COMPETING"].includes(value2) ||
		typeof lastModifiedBy !== "string" || lastModifiedBy === "" ||
		typeof changedById !== "string" || changedById === "") {
		throw new TypeError("Invalid status change");
	}
	return getDatabase().transaction(async (tx) => {
		// The existing schema has a non-unique config index. Serialize bot writers
		// even when the Status row does not exist yet, without altering that schema.
		await tx.query(
			"SELECT pg_advisory_xact_lock(hashtextextended('bot_configs:Status', 0))",
		);
		const existing = await tx.query(
			`SELECT ${columns} FROM public.bot_configs
			 WHERE config = $1 ORDER BY id ASC LIMIT 1 FOR UPDATE`,
			["Status"],
		);
		let result;
		if (existing.rows.length) {
			result = await tx.query(
				`UPDATE public.bot_configs
				 SET value = $2, value2 = $3, value3 = $4,
				 last_modified_by = $5, updated_at = CURRENT_TIMESTAMP
				 WHERE id = $1::bigint RETURNING ${columns}`,
				[existing.rows[0].id, value, value2, value3, lastModifiedBy],
			);
		} else {
			result = await tx.query(
				`INSERT INTO public.bot_configs (config, value, value2, value3, last_modified_by)
				 VALUES ($1, $2, $3, $4, $5) RETURNING ${columns}`,
				["Status", value, value2, value3, lastModifiedBy],
			);
		}
		if (result.rows.length !== 1) {
			throw new Error("Status configuration write did not affect one row");
		}
		const log = await tx.query(
			`INSERT INTO public.bot_config_logs
			 (changed, changed_to, changed_to2, changed_to3, changed_by, changed_by_id)
			 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id::text AS id`,
			["Status", value, value2, value3, changedBy ?? null, changedById],
		);
		if (log.rows.length !== 1) {
			throw new Error("Status log write did not affect one row");
		}
		return result.rows[0];
	});
}

module.exports = {
	getConfigById, getStatusConfig, listConfigs, countConfigs,
	createConfig, updateConfigById, deleteConfigById, setStatusAndLog,
};
