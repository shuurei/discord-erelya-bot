import { Event } from '@/structures'

import prisma from '@/database/db'
import { startAllJobs } from '@/client/jobs/index.js'

export default new Event({
    once: true,
    name: 'clientReady',
    async run() {
        this.client.logger.log('✅ » Successfully logged in !\n');

        try {
            await prisma.$connect();
            this.client.emit('databaseReady');
        } catch (ex) {
            this.client.emit('databaseDisconnected', ex);
        }

        await startAllJobs();
    }
});