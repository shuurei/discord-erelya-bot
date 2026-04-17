import { Event } from '@/structures'

import { startAllJobs } from '@/client/jobs'
import { dataSource } from '@/database/data-source'
import { logger } from '@/utils'

export default new Event({
    once: true,
    name: 'clientSetup',
    async run() {
        try {
            await dataSource.initialize();
            this.client.isDatabaseConnected = true;
            logger.info('Database connexion established', { arrowColor: 'greenBright' });
        } catch (err) {
            logger.info(`Unable to connect to the database: ${err}`, { arrowColor: 'redBright' });
        }

        await startAllJobs();
    }
});