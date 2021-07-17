![GPLv3 Licensed](https://img.shields.io/github/license/IIIRataxIII/Ace-Bot?style=for-the-badge)
![Code quality grade on Codacy](https://img.shields.io/codacy/grade/ce4446ec729946ea81391e6c2b4a72b7?style=for-the-badge)
![GitHub repository size](https://img.shields.io/github/repo-size/IIIRataxIII/Ace-Bot?style=for-the-badge)

# Ace

Ace is a Discord bot made to help you administrate your server and have some fun.

## Installation and Execution

Use the package manager [npm](https://www.npmjs.com/get-npm) to install all the dependencies needed.

```bash
npm install
```
### With nodemon

Now install the nodemon package globally.

```bash
npm install nodemon -g
```

Now use the next command to execute the Ace Bot.

```bash
nodemon main.js
```

### Without nodemon

If you didn't want to install nodemon now use the next command to execute the Ace Bot.

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

## License
[GPLv3](https://github.com/IIIRataxIII/Ace-Bot/blob/master/LICENSE)
