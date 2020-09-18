const Discord = require('discord.js');

const client = new Discord.Client();

const token = 'InsertYourBotTokenHere';

client.once('ready', ()=> {
    console.log('CaptainBot is online!');
})

client.login(token);