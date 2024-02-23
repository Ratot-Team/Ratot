
# ![GPLv3 Licensed](https://img.shields.io/github/license/Ratot-Team/Ratot?style=for-the-badge) ![Code quality grade on Codacy](https://img.shields.io/codacy/grade/578c60d284004b97a26652e0f81abf1a?style=for-the-badge) ![GitHub repository size](https://img.shields.io/github/repo-size/Ratot-Team/Ratot?style=for-the-badge)

# Ratot

Ratot is a Discord bot made to help you administrate your server and have some fun.

## Installation and Execution

Use [npm](https://www.npmjs.com/get-npm) to install all the dependencies needed.

```bash
npm install
```

### Execution with nodemon

Now install the nodemon package globally.

```bash
npm install nodemon -g
```

Now use the next command to execute the Ratot Bot (sometimes you need to close and reopen the terminal if the nodemon command was not recognized).

```bash
nodemon main.js
```

### Execution without nodemon

If you didn't want to install nodemon now use the next command to execute the Ratot Bot.

```bash
npm start
```

To stop the bot press Ctrl+C or just close the window.

## Usage (List of Commands)

### $help (or $h)

The bot sens a menu with some information about the bot and some commands to help.

### $help commands (or $hc)

The bot sends the list of all commands and the description of what they do.

### $ping

The bot responds with "pong", but to know your ping you really have to insist a little bit

### $delete messages \<number\> (or $del \<number\>)

The bot deletes a certain number of messages. Only admins can use this command.

### $hug \<@someone\>

The bot gives a hug to someone you mention. You can mention yourself don't be shy!

### $bot ping (or $bp)

Says the ping value of the bot

### $my ping (or $mp)

Say the value of your ping (kind of... is a little bit complicated xD)

### $prefix \<prefix\> (or $p \<prefix\>)

Change the prefix for the bot commands.

## Admin Usage (list of commands only for bot admins)

### $change status \<number of status\> \<status\> (or $cs \<number of status\> \<status\>)

Change the bot status to whatever the admin wants

### $add admin \<@someone\>

Adds the user as admin to the bot database

### $remove admin \<@someone\>

Removes the user as admin from the bot database

### $list servers (or $ls)

Lists all the servers the bot is on

### $list channels \<optionalServerId\> (or $lc \<optionalServerId\>)

Lists all the channels from the server where the message is sent, or if given an id from a server lists all the channels from that server

## License

[GPLv3](https://github.com/Ratot-Team/Ratot/blob/master/LICENSE)
