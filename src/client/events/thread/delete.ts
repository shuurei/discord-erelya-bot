import { blacklistService } from '@/database/services'
import { Event } from '@/structures'

export default new Event({
    name: 'threadDelete',
    async run({ events: [thread] }) {
        if (thread.parentId === this.client.hub?.ticketChannel?.id) {
            if (await blacklistService.findByThreadId(thread.id)) {
                await blacklistService.removeByThreadId(thread.id);
            }
        }
    }
})