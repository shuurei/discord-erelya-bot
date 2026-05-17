import { Event, FastEmbed } from '@/core'
import { GuildService } from '@/database/services'
import { Events } from 'discord.js'

export default new Event({
    name: Events.MessageUpdate,
    async run({ events: [oldMessage, newMessage] }) {
        if (!oldMessage.guild
            || newMessage.author?.bot
            || oldMessage.content === newMessage.content
            || !oldMessage.content
            || !newMessage.content
            || oldMessage.channel.isDMBased()
            || newMessage.channel.isDMBased()
            || !newMessage.guild
        ) return;

        const { messageDeletedAuditChannelId } = await GuildService.findById(oldMessage.guild.id) ?? {};
        if (!messageDeletedAuditChannelId) return;

        const channel = oldMessage.guild.channels.cache.get(messageDeletedAuditChannelId);
        if (!channel?.isTextBased()) return;

        const author = oldMessage.author;
        if (!author) return;

        return await channel.send({
            embeds: [
                FastEmbed.createMessage({
                    color: 'orange',
                    title: author.username,
                    thumbnail: { url: author.displayAvatarURL() },
                    description: `✏️ **Message modifié**`,
                    fields: [
                        {
                            name: 'Identifiant utilisateur',
                            value: `> \`${author.id}\``,
                        },
                        {
                            name: 'Salon',
                            value: [
                                `> <#${oldMessage.channel.id}>`,
                                `> \`${oldMessage.channel.name}\``
                            ].join('\n'),
                        },
                        {
                            name: 'Avant',
                            value: '> '.concat(oldMessage.content.length > 1024
                                ? oldMessage.content.slice(0, 1022) + '..'
                                : oldMessage.content),
                        },
                        {
                            name: 'Après',
                            value: '> '.concat(newMessage.content.length > 1024
                                ? newMessage.content.slice(0, 1022) + '..'
                                : newMessage.content),
                        }
                    ],
                    footer: { text: oldMessage.guild.name },
                    timestamp: Date.now(),
                }),
            ],
        });
    },
});