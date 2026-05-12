import { Command, FastEmbed } from '@/core'
import { parseChannelMention } from '@/utils'

export default new Command({
    access: {
        user: { isDeveloper: true }
    },
    messageCommand: { style: 'slashCommand' },
    async onMessage(message, { args: [channelId] }) {
        const channel = channelId
            ? message.guild.channels.cache.get(parseChannelMention(channelId) ?? channelId)
            : message.channel;

        if (!channel?.isVoiceBased()) {
            return await message.reply({
                embeds: [
                    FastEmbed.createErrorMessage({
                        title: 'Debug / Sessions Vocales',
                        description: `Oups.. Cette commande s'utilise sur des salons vocaux`
                    })
                ]
            });
        }

        const sessions = this.client.voiceSessions.cache;
        const membersToAdd = channel.members.filter(({ id }) => !sessions.get(id));

        if (membersToAdd.size <= 0) {
            return await message.reply({
                embeds: [
                    FastEmbed.createWarnMessage({
                        title: 'Debug / Sessions Vocales',
                        description: `Le salon <#${channelId}> n'a aucun membre à synchronisé !`
                    })
                ]
            });
        }

        for (const [memberId, { voice }] of membersToAdd) {
            this.client.voiceSessions.start(memberId, voice);
        }

        return await message.reply({
            embeds: [
                FastEmbed.createSuccessMessage({
                    title: 'Debug / Sessions Vocales',
                    description: `Les **${membersToAdd.size}** membres pas synchro sont maintenant en cache ;)`
                })
            ]
        });
    }
});
