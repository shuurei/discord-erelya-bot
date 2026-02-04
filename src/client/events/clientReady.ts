import { Collection } from 'discord.js'
import { Event } from '@/structures'

import { startAllJobs } from '@/client/jobs/index.js'
import prisma from '@/database/db'
import { createNotifCard } from '@/ui/assets/cards/notifCard'

export default new Event({
    once: true,
    name: 'clientReady',
    async run() {
        this.client.logger.log('✅ » Successfully logged in !\n');

        const lunaria = this.client.guilds.cache.get('1280087771540623413')
        if (lunaria && process.env.ENV === 'PROD') {
            lunaria.members.cache.get('1175882929826713791')?.send({
                files: [
                    {
                        attachment: await createNotifCard({
                            text: "[Système opérationnel.]",
                        }),
                        name: 'info.png'
                    }
                ]
            })
        }

        try {
            await prisma.$connect();
            this.client.emit('databaseReady');
        } catch (ex) {
            this.client.emit('databaseDisconnected', ex);
        }

        await startAllJobs();
    }
})