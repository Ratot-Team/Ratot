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
