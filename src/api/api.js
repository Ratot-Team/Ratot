// Ratot - Ratot is a Discord bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

var express = require("express");
var router = new express.Router();

/**
 * Health check endpoint
 * Used by Uptime Kuma
 */
router.get("/health", (req, res) => {
	return res.status(200).json({
		status: "ok",
		timestamp: new Date().toISOString(),
	});
});

module.exports = router;
