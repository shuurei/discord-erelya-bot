import { Cron } from 'croner'
import { toCapitalize } from '@/utils'

import { logger } from './Logger'
import { CustomClient } from './CustomClient'

export class Job extends Cron {
    client: CustomClient;

    constructor(pattern: string | Date, callback: (job: Job) => void) {
        try {
            super(pattern, () => callback(this));
        } catch (err: any) {
            logger.error(err);
        }
    }

    get logger() {
        return logger.use({
            prefix: ({ purpleBright, custom }) => purpleBright(this.name ? `[JOB] ${custom('#e283ff', `<${toCapitalize(this.name)}>`)}` : '[JOB]')
        });
    }
}