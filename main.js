const Discord = require('discord.js');

const client = new Discord.Client();

const token = 'InsertYourBotTokenHere';

const prefix = '$';

var lastPing, pingCounter;

client.once('ready', ()=> {
    console.log('Rat.exe Bot is online!');
    client.user.setActivity('$help', {type:'PLAYING'}).catch(console.error);
});

client.on('message', message=>{
    
    let args = message.content;
    var isCommand = args.charAt(0) == '$';
    args= args.substring(prefix.length).split(" ");
    
    switch(args[0]){
        case 'ping':
            if (lastPing == message.author.id)
                {
                    pingCounter++;
                    if(pingCounter>=5)
                    {
                        message.reply('PONG MOTHERFUCKER! Aren\'t you tired of this shit?!');
                        lastPing = message.author.id;
                    }
                    else
                        message.reply('Pong!');
                }
            else
                {
                    lastPing = message.author.id;
                    pingCounter = 1;
                    message.reply('Pong!');
                };
            break;
        case 'delete':
            if(args[1]!='messages') message.reply('Did you mean "$delete messages"?');
            else
                {
                    if(!args[2] || !Number.isInteger(parseInt(args[2]))) message.reply('Chose the number of messages to delete, for example "$delete messages 2"');
                    else 
                    {
                        if(message.member.hasPermission('ADMINISTRATOR'))
                            {
                                if(args[2]>99)
                                    return message.reply('You can only delete 99 messages!');
                                var n = args[2];
                                n++;
                                message.channel.bulkDelete(n);
                                message.reply(args[2] + ' messages deleted!').then(message=>{
                                    message.delete({timeout:3000})
                                })
                                .catch(console.error);
                            }
                        else
                            message.reply('Only Admins can delete messages!');
                    }
                }
            break;
        case 'help':
            if(!args[1])
            {
                const helpEmbed = new Discord.MessageEmbed()
                .setColor('#339933')
                .setTitle('Rat.exe Bot Help Menu')
                .addFields(
                    {name: 'List of commands', value: '$help commands'},
                    {name: '\u200B', value: '\u200B'},
                    {name: 'See my code on GitHub!' , value: 'https://github.com/IIIRataxIII/Rat.exe-Bot'}
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
                            {name: '$ping', value: 'Bot replys with Pong, but he doesn\'t like that very much...'},
                            {name: '$delete messages <number>', value: 'Bot delete a certain number of messages, only admins are allowed to use this command.'}
                        );
                        message.channel.send(helpCommandsEmbed);
                        break;
                    default:
                        message.reply('Sorry can\'t find that command if you need help type $help');
                        break;
                }
            }
        break;
        default:
            if(isCommand)
                message.reply('Sorry can\'t find that command if you need help type $help');
            break;
    }
})

client.login(token);