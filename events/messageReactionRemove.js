const RoleMessages = require(`../tables/RoleMessages.js`);

const teamEmojis = require('../data/teams.json');
const gameEmojis = require('../data/games.json');
const pronounEmojis = require('../data/pronouns.json');
const bblEmojis = require('../data/bbl.json');

const removeEmojis = function(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '').trim();
}

const removeRoleFromEmojiMap = async function(reaction, member, emojiMap) {
    /* Syntax of emojiMap:
        emojiMap = {
            "emojiName": { roleName: "roleName", emoji: "✅" },
            etc., where emojiName is unicode, otherwise it is left out
        }
    */

    const emojiKeys = Object.keys(emojiMap);
    const roleEmojiKey = emojiKeys.find(key => emojiMap[key].emoji === reaction.emoji.name || key === reaction.emoji.name);
    const roleName = emojiMap[roleEmojiKey].roleName;

    const guildRole = reaction.message.guild.roles.cache.find(role => {
        const strippedRoleName = removeEmojis(role.name);

        return roleName === strippedRoleName;
    });

    if (member.roles.cache.has(guildRole.id)) {
        // Remove this role if the member has it.
        member.roles.remove(guildRole)
            .catch(error => console.error(error));
    }
}

module.exports = {
    name: 'messageReactionRemove',
    once: false,
    async execute(messageReaction, user) {

        if (user.bot) {
            return;
        }

        if (user.partial) {
            await user.fetch()
                .catch(err => {
                    console.error(err);
                    return;
                });
        }
        
        if (messageReaction.partial) {
            await messageReaction.fetch()
                .catch(err => {
                    console.error(err);
                    return;
                });
        }

        const reactionGuildMember = await messageReaction.message.guild.members.fetch(user.id);

        if (!reactionGuildMember) {
            console.log(`User ${user.username} with ID ${user.id} was not found in guild members for guild ${messageReaction.message.guild.name}.`);
            // await messageReaction.message.guild.members.fetch("159609273058459648").send(`User ${user.username} with ID ${user.id} was not found in guild members for guild ${messageReaction.message.guild.name}.`);
            return;
        }
        
        if (reactionGuildMember.partial) {
            try {
                await member.fetch();
            }
            catch (err) {
                console.error(err);
                return;
            }
        }

        const roleMessage = await RoleMessages.findOne({
            where: {
                messageId: messageReaction.message.id,
                guildId: messageReaction.message.guildId,
                channelId:messageReaction.message.channelId
            }
        });

        if (roleMessage) {
            switch (roleMessage.dataValues.roleType) {
                case 'team':
                    await removeRoleFromEmojiMap(messageReaction, reactionGuildMember, teamEmojis);
                    break;

                case 'game':
                    await removeRoleFromEmojiMap(messageReaction, reactionGuildMember, gameEmojis);
                    break;

                case 'bbl':
                    await removeRoleFromEmojiMap(messageReaction, reactionGuildMember, bblEmojis);
                    break;

                case 'pronoun':
                    await removeRoleFromEmojiMap(messageReaction, reactionGuildMember, pronounEmojis);
                    break;
            }
        }
    }
}