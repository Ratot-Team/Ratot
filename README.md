
# ![Ratot Status](https://status.ratotbot.com/api/badge/1/status?style=for-the-badge&label=ratot+status) ![Ratot DB Status](https://status.ratotbot.com/api/badge/2/status?style=for-the-badge&label=ratot+db+status) ![Ratot Uptime](https://status.ratotbot.com/api/badge/1/uptime/72?style=for-the-badge&label=ratot+uptime+%2872h%29) ![Ratot DB Uptime](https://status.ratotbot.com/api/badge/2/uptime/72?style=for-the-badge&label=ratot+db+uptime+%2872h%29) ![GitHub release (latest by date)](https://img.shields.io/github/v/release/Ratot-Team/Ratot?style=for-the-badge) ![GPLv3 Licensed](https://img.shields.io/github/license/Ratot-Team/Ratot?style=for-the-badge) ![Code quality grade on Codacy](https://img.shields.io/codacy/grade/0fac0afc837146f699a969a81ce97d11?style=for-the-badge) ![GitHub repository size](https://img.shields.io/github/repo-size/Ratot-Team/Ratot?style=for-the-badge) ![Discord.js Version](https://img.shields.io/badge/discord.js-v14.14.1-green?style=for-the-badge) ![Node.js Version](https://img.shields.io/badge/node.js-v16.13.0-green?style=for-the-badge) ![GitHub last commit](https://img.shields.io/github/last-commit/Ratot-Team/Ratot?style=for-the-badge) ![GitHub issues](https://img.shields.io/github/issues/Ratot-Team/Ratot?style=for-the-badge) ![GitHub pull requests](https://img.shields.io/github/issues-pr/Ratot-Team/Ratot?style=for-the-badge) ![GitHub language count](https://img.shields.io/github/languages/count/Ratot-Team/Ratot?style=for-the-badge) ![GitHub top language](https://img.shields.io/github/languages/top/Ratot-Team/Ratot?style=for-the-badge) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Ratot-Team/Ratot?style=for-the-badge)

# Ratot

Ratot is a Discord bot made to help you administrate your server and have some fun.

## Status Page

You can check the current status of Ratot, its database, and view incident history on the official status page:

🔗 [status.ratotbot.com](https://status.ratotbot.com)

The status page provides:

- Real-time uptime information
- Database status
- Historical incidents and outages

## Installation and Execution

Use [npm](https://www.npmjs.com/get-npm) to install all the dependencies needed.

```bash
npm install
```

### Execution

Now install the nodemon package globally.

```bash
npm install nodemon -g
```

Now use the next command to execute the Ratot Bot (sometimes you need to close and reopen the terminal if the nodemon command was not recognized).

```bash
npm start
```

To stop the bot press Ctrl+C or just close the window.

## Usage (List of Commands)

### /help

The bot sens a menu with some information about the bot and some commands to help.

### /help-commands

The bot sends the list of all commands and the description of what they do.

### /ping

The bot responds with "pong", but to know the bot ping you really have to insist a little bit

### /prune \<number\>

The bot deletes a certain number of messages. Only admins can use this command.

### /hug \<@someone\>

The bot gives a hug to someone you mention. You can mention yourself don't be shy!

### /bot-ping

Says the ping value of the bot

## Admin Usage (list of commands only for bot admins)

### /change-status \<number of status\> \<status\>

Change the bot status to whatever the admin wants

### /add-bot-admin \<@someone\>

Adds the user as admin to the bot database

### /remove-bot-admin \<@someone\>

Removes the user as admin from the bot database

### /list-servers

Lists all the servers the bot is on

### /list-channels \<optionalServerId\>

Lists all the channels from a given server ID or from the server where the message is sent.

## License

[GPLv3](https://github.com/Ratot-Team/Ratot/blob/master/LICENSE)
