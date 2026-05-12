import { Job } from '@/core'

export default new Job('*/5 * * * * *', ({ logger }) => {
    logger.log('Test ! ');
});
