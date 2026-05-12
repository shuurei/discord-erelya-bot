import { buildWelcomeMessagePayload } from '@/client/handlers/SendWelcomeMessage'
import { Command } from '@/core/command'

export default new Command({
    access: {
        user: {
            isDeveloper: true
        }
    },
    async onMessage(message) {
        const payload = buildWelcomeMessagePayload(message.guild, message.author);

        return await message.channel.send(payload);
    }
});
