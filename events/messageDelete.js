const { MessageEmbed } = require('discord.js');
const { deletedMessageChannelName } = require('../config.json')

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message) {
        if (message.partial) {
            console.log("Partial Message deleted, no data can be retrieved");
            return;
        }
        if (!message.author) {
            console.log("Message has no author:");
            console.log(message);
            return;
        }
        if (message.author.bot) {
            return;
        }
        if (!message.guild) {
            return;
        }
        if (message.channel.name === deletedMessageChannelName) {
            return;
        }

        const messageGuildMember = await message.guild.members.fetch(message.author.id)
            .catch(err => {
                console.error(err);
                return;
            });
        if (!messageGuildMember) {
            return;
        }
        
        await messageGuildMember.fetch()
            .catch(err => {
                console.error(err);
                return;
            });

        const embed = new MessageEmbed()
            .setThumbnail(message.author.avatarURL())
            .setTitle(`${messageGuildMember.displayName}`)
            .setColor(0x345b95) // standard blue
            .setDescription(`**Message by ${messageGuildMember.toString()} in ${message.channel.toString()}:**\n${message.content}`)
            .setTimestamp();

        await message.guild.channels.cache.find(channel => channel.name === deletedMessageChannelName)?.send({ embeds: [embed] })
            .catch(err => console.error(err));
        
    }
}