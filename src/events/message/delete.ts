import { Event, FastEmbed } from '@/core'
import { GuildService } from '@/database/services'
import { Events } from 'discord.js'

export default new Event({
    name: Events.MessageDelete,
    async run({ events: [message] }) {
        if (!message.guild || message.author?.bot || message.channel.isDMBased()) return;

        const { messageEditedAuditChannelId } = await GuildService.findById(message.guild.id) ?? {};
        if (!messageEditedAuditChannelId) return;

        const channel = message.guild.channels.cache.get(messageEditedAuditChannelId);
        if (!channel?.isTextBased()) return;

        const author = message.author;
        if (!author) return;

        const images = message.attachments.filter(({ contentType }) => contentType?.startsWith('image/'));
        const firstImage = images.first();

        if (images.size < 1 && !message.content) return;

        return await channel.send({
            embeds: [
                FastEmbed.createMessage({
                    color: 'red',
                    title: author.username,
                    thumbnail: { url: author.displayAvatarURL() },
                    image: firstImage ? { url: firstImage.proxyURL } : undefined,
                    description: `🗑️ **Message supprimé**`,
                    fields: [
                        {
                            name: 'Identifiant utilisateur',
                            value: `> \`${author.id}\``,
                        },
                        {
                            name: 'Salon',
                            value: [
                                `> <#${message.channel.id}>`,
                                `> \`${message.channel.name}\``
                            ].join('\n'),
                        },
                        message.content && {
                            name: 'Contenu',
                            value: '> '.concat(message.content.length > 1024
                                ? message.content.slice(0, 1022) + '..'
                                : message.content),
                        },
                        images.size > 1 && {
                            name: 'Images',
                            value: images.first(3).map(({ name, proxyURL }) => `- [${name}](${proxyURL})`).join('\n').slice(0, 1024),
                        },
                    ].filter(Boolean) as any,
                    footer: { text: message.guild.name },
                    timestamp: Date.now(),
                }),
            ],
        });
    },
});