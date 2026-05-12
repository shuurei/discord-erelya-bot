import { Cron } from 'croner'
import { toCapitalize } from '@/utils'
import { logger } from './Logger'

export class Job extends Cron {
    constructor(pattern: string | Date, callback: (job: Job) => void) {
        try {
            super(pattern, () => callback(this));
        } catch (err: any) {
            logger.error(err);
        }
    }

    get logger() {
        return logger.use({
            prefix: ({ purpleBright, custom }) => purpleBright(`[JOB] ${custom('#e283ff', `<${toCapitalize(this.name!)}>`)}`)
        });
    }
}