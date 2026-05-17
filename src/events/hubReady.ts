import { createNotifCard } from '@/components/cards'
import { Event } from '@/core'
import { env } from '@/utils'

export default new Event({
    name: 'hubReady',
    async run({ events: [hub] }) {
        if (env.isProd && hub && hub.heartLogsChannel) {
            await hub.heartLogsChannel.send({
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
})