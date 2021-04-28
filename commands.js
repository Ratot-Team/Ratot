var lastPing, pingCounter; //For ping and pong reasons xD 
//lastPing- saves the Id of the person that called the last ping command
//pingCounter - Saves how many times the same person called the ping command
module.exports = {
    ping: function(message, client){
        if (lastPing == message.author.id){ //If is the same person that called the ping command before
            pingCounter++; 
            if(pingCounter>=5){ //If the same person has called the ping command 5 or more times in a row
                message.channel.send("...").then(m =>{ //Send a "..." message and then
                    var latency = m.createdTimestamp - message.createdTimestamp; //Calculate ao many ms the user has (I think it doesn't work very well)
                    var botPing = client.ws.ping; //Saves the bot ping
                    //Edit the "..." message with the one with the calculated pings
                    m.edit('Oh... Sorry... Right! My ping is ' + botPing + 'ms and yours is more or less ' + latency + 'ms'); 
                });
                lastPing = message.author.id; //Saves who called the ping command
                pingCounter = 1; //Reset the ping counter
            }
            else
                message.reply('Pong');
        }else{
            lastPing = message.author.id;
            pingCounter = 1;
            message.reply('Pong');
        };
    },
    delete: function(args, message){
        if(args[1]!='messages') //args[1] is the second word from the command
            message.reply('Did you mean \"' + prefix + 'delete messages\"?'); //Send a warning message to the user
        else{
            if(!args[2] || !Number.isInteger(parseInt(args[2]))) //Verify if the third "word" from the command is a number
                message.reply('Type the number of messages you want to delete, for example \"' + prefix + 'delete messages 2\"'); //Send a warning message to the user
            else{
                if(message.member.hasPermission('ADMINISTRATOR')){ //Only proceed to the deletion of the messages if the user is an admin
                    //args[2] is the number of messages the user wants to delete
                    if(args[2]>99)
                        return message.reply('You can only delete 99 messages!');
                    if(args[2]<0)
                        return message.reply('Think a little bit of what you asked me to do... Did you really thought you could delete negative messages? Pff humans...');
                    if(args[2]==0)
                        return message.reply('Nothing deleted! Because you know... 0 is nothing human...');
                    let n = args[2];
                    n++;
                    message.channel.bulkDelete(n); //Delte the number of messages requested by the user
                    if(args[2]==1)
                            message.reply(args[2] + ' message has been deleted!').then(message=>{
                                message.delete({timeout:5000}) //Delete the success message after 5 seconds
                        }).catch(console.error);
                    else
                        message.reply(args[2] + ' messages have been deleted!').then(message=>{
                                message.delete({timeout:3000})
                        }).catch(console.error);
                }
                else
                    message.reply('Only admins can delete messages!');
            }
        }
    },
    help: function(args, Discord, message, prefix){
        if(!args[1])
                {
                    const helpEmbed = new Discord.MessageEmbed()
                    .setColor('#339933')
                    .setTitle('Ace Bot Help Menu')
                    .addFields(
                        {name: 'Commands List', value: prefix + 'help commands'},
                        {name: '\u200B', value: '\u200B'},
                        {name: 'See my code on GitHub!' , value: 'https://github.com/IIIRataxIII/Ace-Bot'}
                    ); //Create a personalized embed message
                    message.channel.send(helpEmbed); //Send that embed message
                }
                else
                {
                    switch(args[1]){
                        case 'commands':
                            const helpCommandsEmbed = new Discord.MessageEmbed()
                            .setColor('#339933')
                            .setTitle('Commands List')
                            .addFields(
                                {name: prefix + 'ping', value: 'The bot responds with \"pong\", but to know your ping you really have to insist a little bit'},
                                {name: prefix + 'delete messages <number>', value: 'The bot deletes a certain number of messages. Only admins can use this command.'},
                                {name: prefix + 'hug <@someone>', value: 'The bot gives a hug to someone you mention. You can mention yourself don\'t be shy!'},
                                {name: prefix + 'bot ping', value: 'Says the ping value of the bot'},
                                {name: prefix + 'my ping', value: 'Say the value of your ping (kind of... is a little bit complicated xD)'}
                            );
                            message.channel.send(helpCommandsEmbed);
                            break;
                        default:
                            message.reply('Sorry I don\'t recognize that command, but if you want type \"'+ prefix +'help commands\" to see what I can do.');
                            break;
                    }
                }
    },
    hug: function(args, message, prefix, currentBotDiscordId){
        if(!args[1] || args[1].charAt(1)!='@') //If the second word of the command isn't a mention
                    return message.reply('Mention who you want to hug, for example \"' + prefix + 'hug <@!' + currentBotDiscordId + '>\"');
                if(args[1]=='<@!' + currentBotDiscordId + '>') //If the user mentioned the bot
                    message.channel.send('I hugged myself at the request of <@!' + message.author.id + '>');
                else if(args[1]=='<@!' + message.author.id + '>') //If the user mentioned himself
                    message.reply('I hugged you!');
                else
                    message.channel.send('I hugged ' + args[1] + ' at the request of <@!' + message.author.id + '>');
    },
    bot: function(args, message, prefix, client){
        if(args[1]!='ping')
                    return message.reply('Did you mean \"' + prefix + 'bot ping\"?');
                message.channel.send("Testing connection...").then(m =>{ //Send a temporary message and then
                    var botPing = client.ws.ping; //Saves the bot ping
                    m.edit('My ping is: ' + botPing + 'ms'); //Edit the temporary message with the one with the calculated ping
                });
    },
    my: function(args, message, prefix){
        if(args[1]!='ping')
                    return message.reply('Did you mean \"' + prefix + 'my ping\"?');
                message.channel.send("Testing your connection...").then(m =>{ //Send a temporary message and then
                    var latency = m.createdTimestamp - message.createdTimestamp; //Calculate ao many ms the user has (I think it doesn't work very well)
                    m.edit('Your ping is more or less: ' + latency + 'ms'); //Edit the temporary message with the one with the calculated ping
                });
    }
}