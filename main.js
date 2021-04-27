require('dotenv').config()

const Discord = require('discord.js');

const client = new Discord.Client();

const token = process.env.ACE_BOT_DEV_TOKEN;

const prefix = '$';

var lastPing, pingCounter;

client.once('ready', ()=> {
    console.log('Ace Bot is online!');
    client.user.setActivity('$help', {type:'LISTENING'}).catch(console.error);
});

client.on('message', message=>{
    
    let args = message.content;
    var isCommand = args.charAt(0) == '$';
    args= args.substring(prefix.length).split(" ");
    if(isCommand)
    {
        switch(args[0]){
            case 'ping':
                if (lastPing == message.author.id)
                    {
                        pingCounter++;
                        if(pingCounter>=5)
                        {
                            message.channel.send("...").then(m =>{
                                var latency = m.createdTimestamp - message.createdTimestamp;
                                var botPing = client.ws.ping;
                                m.edit('Oh... Sorry... Right! My ping is ' + botPing + 'ms and yours is more or less ' + latency + 'ms');
                            });
                            lastPing = message.author.id;
                        }
                        else
                            message.reply('Pong');
                    }
                else
                    {
                        lastPing = message.author.id;
                        pingCounter = 1;
                        message.reply('Pong');
                    };
                break;
            case 'delete':
                if(args[1]!='messages') message.reply('Did you mean "$delete messages"?');
                else
                    {
                        if(!args[2] || !Number.isInteger(parseInt(args[2]))) message.reply('Type the number of messages you want to delete, for example "$delete messages 2"');
                        else 
                        {
                            if(message.member.hasPermission('ADMINISTRATOR'))
                                {
                                    if(args[2]>99)
                                        return message.reply('You can only delete 99 messages!');
                                    if(args[2]<0)
                                        return message.reply('Think a little bit of what you asked me to do... Did you really thought you could delete negative messages? Pff humans...');
                                    var n = args[2];
                                    n++;
                                    message.channel.bulkDelete(n);
                                    if(args[2]==1)
                                         message.reply(args[2] + ' message has been deleted!').then(message=>{
                                             message.delete({timeout:3000})
                                        })
                                        .catch(console.error);
                                    else
                                        message.reply(args[2] + ' messages have been deleted!').then(message=>{
                                             message.delete({timeout:3000})
                                        })
                                        .catch(console.error);
                                }
                            else
                                message.reply('Only admins can delete messages!');
                        }
                    }
                break;
            case 'help':
                if(!args[1])
                {
                    const helpEmbed = new Discord.MessageEmbed()
                    .setColor('#339933')
                    .setTitle('Ace Bot Help Menu')
                    .addFields(
                        {name: 'Commands List', value: '$help commands'},
                        {name: '\u200B', value: '\u200B'},
                        {name: 'See my code on GitHub!' , value: 'https://github.com/IIIRataxIII/Ace-Bot'}
                    );
                    message.channel.send(helpEmbed);
                }
                else
                {
                    switch(args[1]){
                        case 'commands':
                            const helpCommandsEmbed = new Discord.MessageEmbed()
                            .setColor('#339933')
                            .setTitle('Commands List')
                            .addFields(
                                {name: '$ping', value: 'The bot responds with \"pong\", but to know your ping you really have to insist a little bit'},
                                {name: '$delete messages <number>', value: 'The bot deletes a certain number of messages, only admins can use this command.'},
                                {name: '$hug <@someone>', value: 'The bot gives a hug to someone you mention'},
                                {name: '$bot ping', value: 'Says the ping value of the bot'},
                                {name: '$my ping', value: 'Say the value of your ping (kind of... is a little bit complicated xD)'}
                            );
                            message.channel.send(helpCommandsEmbed);
                            break;
                        default:
                            message.reply('Sorry I don\'t recognize that command, but if you want type \"'+ prefix +'help commands\" to see what I can do.');
                            break;
                    }
                }
            break;
            case 'hug':
                if(!args[1]|| args[1].charAt(1)!='@')
                    return message.reply('Mention who you want to hug, for example "$hug <@!756290869900083272>"');
                if(args[1]=='<@!756290869900083272>')
                    message.channel.send('I hugged myself at the request of <@!' + message.author.id + '>');
                else
                    message.channel.send('I hugged ' + args[1] + ' at the request of <@!' + message.author.id + '>');
                break;
            case 'bot':
                if(args[1]!='ping')
                    return message.reply('Did you mean "$bot ping"?');
                message.channel.send("Testing connection...").then(m =>{
                    var botPing = client.ws.ping;
                    m.edit(`My ping is: ${botPing}ms`);
                });
                break;
            case 'my':
                if(args[1]!='ping')
                    return message.reply('Did you mean "$my ping"?');
                message.channel.send("Testing your connection...").then(m =>{
                    var latency = m.createdTimestamp - message.createdTimestamp;
                    m.edit(`Your ping is more or less: ${latency}ms`);
                });
                break;
            default:
                if(isCommand)
                    message.reply('Sorry I don\'t recognize that command, but if you want type \"'+ prefix +'help commands\" to see what I can do.');
                break;
        }
    }
})

client.login(token);