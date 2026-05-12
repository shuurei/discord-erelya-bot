import fg from 'fast-glob'
import { pathToFileURL } from 'url'

import path from 'path'

import { CustomClient } from '../CustomClient'
import { logger } from '../Logger'
import { Job } from '../Job'
import { toCapitalize } from '@/utils'

export interface JobManagerOptions {
    directoryPath: string;
}

export class JobManager {
    cache = new Map<string, Job>;

    constructor(public client: CustomClient) { }

    async initialize(options: JobManagerOptions) {
        logger.info('Starting jobs..', { arrowColor: 'orangeBright' });

        const cwd = './src/';

        let stats = { valid: 0, invalid: 0 }

        const files = await fg(options.directoryPath.concat('/**/*.{ts,js}'), { cwd });
        if (files.length > 0) {
            logger.header(({ orange }) => orange('✦ JOBS ✦'));

            for (const filePath of files) {
                const mod = (await import(pathToFileURL(`${cwd}/${filePath}`).href))?.default;
                if (!(mod instanceof Job)) {
                    stats.invalid++;
                    continue
                };

                const jobName = path.basename(filePath).split('.')[0];
                mod.name = jobName;

                this.cache.set(jobName, mod);

                logger.log(({ custom }) => `⏰ ${custom('#e283ff', toCapitalize(jobName))} [${mod.getPattern()}]`);
                stats.valid++;
            }

            logger.separator();

            if (stats.invalid) {
                logger.info(({ redBright }) => `${redBright(stats.invalid)} invalid jobs`, { arrowColor: 'redBright' });
            }

            logger.info(({ greenBright }) => `${greenBright(stats.valid)} jobs started`, { arrowColor: 'greenBright' });
        } else {
            logger.info(({ redBright }) => redBright(`No jobs were detected to start`), { arrowColor: 'red' });
        }
    }

    restart(jobName: string) {
        let job = this.cache.get(jobName);
        if (job) {
            job.pause();
            job.resume();
            job.trigger();

            job.logger.log('Restard')
        }
    }

    kill(jobName: string) {
        const job = this.cache.get(jobName);
        if (job && job.isRunning()) {
            job.stop();
        }
    }
}

export default JobManager;