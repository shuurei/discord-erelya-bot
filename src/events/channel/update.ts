import { Event } from '@/core'
import { Events } from 'discord.js'

export default new Event({
    name: Events.ChannelUpdate,
    async run({ events: [oldChannel, newChannel] }) {
        if (!newChannel.isVoiceBased()) return;

        const everyonePerm = newChannel.permissionsFor(newChannel.guild.roles.everyone);
        const isPrivate = everyonePerm ? !(everyonePerm.has('Connect') && everyonePerm.has('ViewChannel')) : false;

        for (const [_, session] of this.client.voiceSessions.cache) {
            if (session.channelId === newChannel.id) {
                session.flags.isPrivate = isPrivate;
            }
        }
    }
});
