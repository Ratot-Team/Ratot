const Discord = require('discord.js');

const client = new Discord.Client();

const token = 'Insere aqui o token do bot';

const prefix = '$';

var lastPing, pingCounter;

client.once('ready', ()=> {
    console.log('Rat.exe Bot está online!');
    client.user.setActivity('$help', {type:'PLAYING'}).catch(console.error);
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
                            message.channel.send("FODASSE").then(m =>{
                                var latency = m.createdTimestamp - message.createdTimestamp;
                                var botPing = client.ws.ping;
                                m.edit('PONG CARALHO! O meu ping é ' + botPing + 'ms e o teu é ' + latency + 'ms seu merdas!');
                            });
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
                if(args[1]!='messages') message.reply('Será que querias dizer "$delete messages"?');
                else
                    {
                        if(!args[2] || !Number.isInteger(parseInt(args[2]))) message.reply('Escreve o número de mensagens que queres eliminar, por exemplo "$delete messages 2"');
                        else 
                        {
                            if(message.member.hasPermission('ADMINISTRATOR'))
                                {
                                    if(args[2]>99)
                                        return message.reply('Só podes eliminar 99 mensagens!');
                                    if(args[2]<0)
                                        return message.reply('Achas que podes elminar mensagens negativas? Pff humanos...');
                                    var n = args[2];
                                    n++;
                                    message.channel.bulkDelete(n);
                                    if(args[2]==1)
                                         message.reply(args[2] + ' mensagem foi eliminada!').then(message=>{
                                             message.delete({timeout:3000})
                                        })
                                        .catch(console.error);
                                    else
                                        message.reply(args[2] + ' mensagens foram eliminas!').then(message=>{
                                             message.delete({timeout:3000})
                                        })
                                        .catch(console.error);
                                }
                            else
                                message.reply('Apenas administradores podem eliminar mensagens!');
                        }
                    }
                break;
            case 'help':
                if(!args[1])
                {
                    const helpEmbed = new Discord.MessageEmbed()
                    .setColor('#339933')
                    .setTitle('Menu de Ajuda Rat.exe Bot')
                    .addFields(
                        {name: 'Lista de comandos', value: '$help commands'},
                        {name: '\u200B', value: '\u200B'},
                        {name: 'Vê o meu código no GitHub!' , value: 'https://github.com/IIIRataxIII/Rat.exe-Bot'}
                    );
                    message.channel.send(helpEmbed);
                }
                else
                {
                    switch(args[1]){
                        case 'commands':
                            const helpCommandsEmbed = new Discord.MessageEmbed()
                            .setColor('#339933')
                            .setTitle('Lista de Comandos')
                            .addFields(
                                {name: '$ping', value: 'O bot respode com pong e se repetires várias vezes ele diz-te o ping dele e o teu, mas ele não gosta muito que repitam várias vezes...'},
                                {name: '$delete messages <number>', value: 'O bot elimina um certo número de mensagens, apenas admins podem usar este comando.'},
                                {name: '$abraçar <@alguem>', value: 'O bot dá um abraço a alguém que tu menciones'},
                                {name: '$bot ping', value: 'Diz o valor do ping do bot'},
                                {name: '$meu ping', value: 'Diz o valor do teu ping'}
                            );
                            message.channel.send(helpCommandsEmbed);
                            break;
                        default:
                            message.reply('Sorry não conheço esse comando, mas se quiseres escreve "$help commands" para veres o que posso fazer.');
                            break;
                    }
                }
            break;
            case 'abraçar':
                if(!args[1])
                    return message.reply('Menciona quem queres abraçar, por exemplo "$abraçar @Rat.exe Bot#1386"');
                message.channel.send('Abraçei o ' + args[1] + ' a pedido do <@!' + message.author.id + '>');
                break;
            case 'bot':
                if(args[1]!='ping')
                    return message.reply('Será que querias dizer "$bot ping"?');
                message.channel.send("A testar a conexão...").then(m =>{
                    var botPing = client.ws.ping;
                    m.edit(`O meu ping é: ${botPing}ms`);
                });
                break;
            case 'meu':
                if(args[1]!='ping')
                    return message.reply('Será que querias dizer "$meu ping"?');
                message.channel.send("A testar a tua conexão...").then(m =>{
                    var latency = m.createdTimestamp - message.createdTimestamp;
                    m.edit(`O teu ping é: ${latency}ms`);
                });
                break;
            default:
                if(isCommand)
                    message.reply('Sorry não conheço esse comando, mas se quiseres escreve "$help commands" para veres o que posso fazer.');
                break;
        }
    }
})

client.login(token);