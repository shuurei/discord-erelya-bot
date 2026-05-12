import { Command } from '@/core/command'

import { EmbedUI } from '@/ui'
import { createNotifCard, themes } from '@/ui/assets/cards/notifCard'

export default new Command({
    access: {
        user: {
            isDeveloper: true
        }
    },
    async onMessage(message, { args: [theme, ...text] }) {
        const themesName = Object.keys(themes);

        if (!themesName.includes(theme!)) {
            return await message.channel.send({
                embeds: [
                    EmbedUI.createErrorMessage({
                        title: 'Thème invalide',
                        description: [
                            `Liste des thèmes valide :`,
                            themesName.map((name) => `- \`${name}\``).join('\n')
                        ].join('\n')
                    })
                ]
            });
        }

        return await message.channel.send({
            files: [
                {
                    attachment: await createNotifCard({
                        text: text.join(' '),
                        theme: theme as any
                    }),
                    name: 'debug-notify-card.png'
                }
            ]
        }).then(() => message.delete());
    }
});
