/**
 * ONE-TIME SCRIPT: run this locally (never on a server) to obtain a
 * Google Calendar OAuth2 refresh token for CarePulse.
 *
 * Usage:
 *   node scripts/get-refresh-token.js
 */
require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error(
        "Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI in .env"
    );
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // required to get a refresh_token
    prompt: "consent",      // forces Google to re-issue a refresh_token even
    // if this account authorized before
    scope: SCOPES,
});

const app = express();
const PORT = new URL(GOOGLE_REDIRECT_URI).port || 5000;
const CALLBACK_PATH = new URL(GOOGLE_REDIRECT_URI).pathname;

app.get(CALLBACK_PATH, async (req, res) => {
    const { code } = req.query;
    if (!code) {
        res.status(400).send("No authorization code received.");
        return;
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
            res.send(
                "No refresh_token returned. This usually means you've already " +
                "authorized this app before without revoking access. Go to " +
                "https://myaccount.google.com/permissions, remove CarePulse's " +
                "access, then re-run this script."
            );
            console.error("No refresh_token in response:", tokens);
            return;
        }

        // Auto-write / update GOOGLE_REFRESH_TOKEN in .env
        const envPath = path.join(__dirname, "..", ".env");
        let envContent = fs.readFileSync(envPath, "utf8");
        if (envContent.includes("GOOGLE_REFRESH_TOKEN=")) {
            envContent = envContent.replace(
                /GOOGLE_REFRESH_TOKEN=".*"/,
                `GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`
            );
        } else {
            envContent += `\nGOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`;
        }
        fs.writeFileSync(envPath, envContent);

        console.log("\n✅ Success! Refresh token saved to .env automatically.");
        console.log("GOOGLE_REFRESH_TOKEN=" + tokens.refresh_token);

        res.send(
            "<h2>✅ Success!</h2><p>Refresh token has been saved to your .env file. " +
            "You can close this tab and stop the script (Ctrl+C) in your terminal.</p>"
        );

        setTimeout(() => process.exit(0), 1000);
    } catch (err) {
        console.error("Error exchanging code for tokens:", err.message);
        res.status(500).send("Error exchanging code for tokens: " + err.message);
    }
});

app.listen(PORT, () => {
    console.log("\n🔗 Open this URL in your browser to authorize CarePulse:\n");
    console.log(authUrl);
    console.log(
        `\nWaiting for Google to redirect back to ${GOOGLE_REDIRECT_URI} ...\n`
    );
});