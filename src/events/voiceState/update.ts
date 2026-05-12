import { Event } from '@/core'
import { Events } from 'discord.js'

export default new Event({
    name: Events.VoiceStateUpdate,
    async run({ events: [oldState, newState] }) {
        const userId = oldState.id;
        const guildId = oldState.guild.id;

        const manager = this.client.voiceSessions;

        if (!oldState.channelId && newState.channelId) {
            return manager.start(userId, newState);
        }

        if (oldState.channelId && !newState.channelId) {
            await manager.flush(userId, guildId);
            return manager.stop(userId);
        }

        return await manager.update(userId, newState);
    }
});
