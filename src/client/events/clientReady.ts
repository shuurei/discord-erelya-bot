import { Event } from '@/structures'

import prisma from '@/database/db'
import { startAllJobs } from '@/client/jobs/index.js'
import { createNotifCard } from '@/ui/assets/cards/notifCard';

export default new Event({
    once: true,
    name: 'clientReady',
    async run() {
        this.client.logger.log('✅ » Successfully logged in !\n');

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

        try {
            await prisma.$connect();
            this.client.emit('databaseReady');
        } catch (ex) {
            this.client.emit('databaseDisconnected', ex);
        }

        await startAllJobs();
    }
});