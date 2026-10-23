// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { getDatabase } = require("../db");
const { idText, page, updateFields } = require("./common");

const columns = "id::text AS id, mongo_id, changed, changed_to, changed_to2, changed_to3, changed_by, changed_by_id, created_at, updated_at";

async function getLogById(id) {
	const result = await getDatabase().query(
		`SELECT ${columns} FROM public.bot_config_logs WHERE id = $1::bigint`,
		[idText(id)],
	);
	return result.rows[0] || null;
}

async function listLogs({ changed = null, ...options } = {}) {
	const { limit, offset } = page(options);
	const result = await getDatabase().query(
		`SELECT ${columns} FROM public.bot_config_logs
		 WHERE ($1::text IS NULL OR changed = $1)
		 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
		[changed, limit, offset],
	);
	return result.rows;
}

async function countLogs(changed = null) {
	const result = await getDatabase().query(
		"SELECT count(*)::text AS count FROM public.bot_config_logs WHERE ($1::text IS NULL OR changed = $1)",
		[changed],
	);
	return result.rows[0].count;
}

async function createLog({ changed = null, changedTo = null, changedTo2 = null,
	changedTo3 = null, changedBy = null, changedById = null }) {
	const result = await getDatabase().query(
		`INSERT INTO public.bot_config_logs
		 (changed, changed_to, changed_to2, changed_to3, changed_by, changed_by_id)
		 VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${columns}`,
		[changed, changedTo, changedTo2, changedTo3, changedBy, changedById],
	);
	return result.rows[0];
}

async function updateLogById(id, patch) {
	const { assignments, values } = updateFields(patch, {
		changed: "changed", changedTo: "changed_to", changedTo2: "changed_to2",
		changedTo3: "changed_to3", changedBy: "changed_by", changedById: "changed_by_id",
	});
	const result = await getDatabase().query(
		`UPDATE public.bot_config_logs SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
		 WHERE id = $1::bigint RETURNING ${columns}`,
		[idText(id), ...values],
	);
	return result.rows[0] || null;
}

async function deleteLogById(id) {
	const result = await getDatabase().query("DELETE FROM public.bot_config_logs WHERE id = $1::bigint", [idText(id)]);
	return result.rowCount;
}

module.exports = { getLogById, listLogs, countLogs, createLog, updateLogById, deleteLogById };
