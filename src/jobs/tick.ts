import { Job } from '@/core'

export default new Job('* * * * *', ({ client, logger }) => {
    for (const [userId, session] of client.voiceSessions.cache) {
        const guild = client.guilds.cache.find((guild) => guild.id === session.guildId);
        if (!guild) return;

        // console.log(userId, session);
    }
});
