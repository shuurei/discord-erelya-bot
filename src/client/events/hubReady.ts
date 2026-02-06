import { Event } from '@/structures'
import { createNotifCard } from '@/ui/assets/cards/notifCard';

export default new Event({
    once: true,
    name: 'hubReady',
    async run() {
        if (this.client.hub && this.client.hub?.heartLogsChannel) {
            await this.client.hub.heartLogsChannel.send({
                files: [
                    {
                        attachment: await createNotifCard({
                            text: "[Système opérationnel.]",
                        }),
                        name: 'info.png'
                    }
                ]
            });
        }
    }
});