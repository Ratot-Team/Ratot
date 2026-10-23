// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 Captain Ratax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const { getDatabase } = require("../db");
const { idText, page, updateFields } = require("./common");

const columns = "id::text AS id, mongo_id, user_id, user_name, created_by, created_by_id, created_at, updated_at";

async function isAdmin(userId) {
	const result = await getDatabase().query(
		"SELECT EXISTS (SELECT 1 FROM public.bot_admins WHERE user_id = $1) AS exists",
		[userId],
	);
	return result.rows[0].exists;
}

async function getAdminById(id) {
	const result = await getDatabase().query(
		`SELECT ${columns} FROM public.bot_admins WHERE id = $1::bigint`,
		[idText(id)],
	);
	return result.rows[0] || null;
}

async function listAdmins(options) {
	const { limit, offset } = page(options);
	const result = await getDatabase().query(
		`SELECT ${columns} FROM public.bot_admins ORDER BY id ASC LIMIT $1 OFFSET $2`,
		[limit, offset],
	);
	return result.rows;
}

async function countAdmins() {
	const result = await getDatabase().query("SELECT count(*)::text AS count FROM public.bot_admins");
	return result.rows[0].count;
}

async function createAdmin({ userId = null, userName = null, createdBy = null, createdById = null }) {
	const result = await getDatabase().query(
		`INSERT INTO public.bot_admins (user_id, user_name, created_by, created_by_id)
		 VALUES ($1, $2, $3, $4) RETURNING ${columns}`,
		[userId, userName, createdBy, createdById],
	);
	return result.rows[0];
}

async function addAdminIfAbsent({ userId, userName = null, createdBy = null, createdById = null }) {
	if (typeof userId !== "string" || userId === "") {
		throw new TypeError("userId is required");
	}
	return getDatabase().transaction(async (tx) => {
		await tx.query(
			"SELECT pg_advisory_xact_lock(hashtextextended('bot_admins:' || $1::text, 0))",
			[userId],
		);
		const existing = await tx.query(
			`SELECT ${columns} FROM public.bot_admins WHERE user_id = $1 ORDER BY id ASC LIMIT 1`,
			[userId],
		);
		if (existing.rows.length) {
			return { created: false, row: existing.rows[0] };
		}
		const inserted = await tx.query(
			`INSERT INTO public.bot_admins (user_id, user_name, created_by, created_by_id)
			 VALUES ($1, $2, $3, $4) RETURNING ${columns}`,
			[userId, userName, createdBy, createdById],
		);
		return { created: true, row: inserted.rows[0] };
	});
}

async function updateAdminById(id, patch) {
	const { assignments, values } = updateFields(patch, {
		userId: "user_id",
		userName: "user_name",
		createdBy: "created_by",
		createdById: "created_by_id",
	});
	const result = await getDatabase().query(
		`UPDATE public.bot_admins SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
		 WHERE id = $1::bigint RETURNING ${columns}`,
		[idText(id), ...values],
	);
	return result.rows[0] || null;
}

async function deleteAdminById(id) {
	const result = await getDatabase().query(
		"DELETE FROM public.bot_admins WHERE id = $1::bigint",
		[idText(id)],
	);
	return result.rowCount;
}

async function removeAdminsByUserId(userId) {
	return getDatabase().transaction(async (tx) => {
		await tx.query(
			"SELECT pg_advisory_xact_lock(hashtextextended('bot_admins:' || $1::text, 0))",
			[userId],
		);
		const result = await tx.query("DELETE FROM public.bot_admins WHERE user_id = $1", [userId]);
		return result.rowCount;
	});
}

module.exports = {
	isAdmin, getAdminById, listAdmins, countAdmins, createAdmin,
	addAdminIfAbsent, updateAdminById, deleteAdminById, removeAdminsByUserId,
};
