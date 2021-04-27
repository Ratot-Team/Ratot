require('dotenv').config()

var commands = require('./commands')

const Discord = require('discord.js');

const client = new Discord.Client();

const token = process.env.ACE_BOT_DEV_TOKEN;

const prefix = '$';


client.once('ready', ()=> {
    console.log('Ace Bot is online!');
    client.user.setActivity('$help', {type:'LISTENING'}).catch(console.error);
});

client.on('message', message=>{
    
    let args = message.content;
    var isCommand = args.charAt(0) == prefix;
    args= args.substring(prefix.length).split(" ");
    if(isCommand)
    {
        switch(args[0]){
            case 'ping':
                commands.ping(message, client);
                break;
            case 'delete':
                commands.delete(args, message);
                break;
            case 'help':
                commands.help(args, Discord, message, prefix);
            break;
            case 'hug':
                commands.hug(args, message, prefix);
                break;
            case 'bot':
                commands.bot(args, message, prefix, client);
                break;
            case 'my':
                commands.my(args, message, prefix);
                break;
            default:
                if(isCommand)
                    message.reply('Sorry I don\'t recognize that command, but if you want type \"'+ prefix +'help commands\" to see what I can do.');
                break;
        }
    }
})

client.login(token);