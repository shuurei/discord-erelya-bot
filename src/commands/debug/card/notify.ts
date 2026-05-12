import { Command, FastEmbed } from '@/core'
import { createNotifCard, notifyThemes } from '@/components/cards'

export default new Command({
    access: {
        user: { isDeveloper: true }
    },
    async onMessage(message, { args: [theme, ...text] }) {
        const themesName = Object.keys(notifyThemes);

        if (!themesName.includes(theme!)) {
            return await message.channel.send({
                embeds: [
                    FastEmbed.createErrorMessage({
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
                        theme
                    }),
                    name: 'DebugNotifyCard.png'
                }
            ]
        }).then(() => message.delete());
    }
});
