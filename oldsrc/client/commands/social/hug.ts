import { Command } from '@/core/command'
import { ApplicationCommandOptionType } from 'discord.js'

import { waifuAPI } from '@/api'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Command({
    description: '🤗 hug someone',
    nameLocalizations: {
        fr: 'câlin',
    },
    descriptionLocalizations: {
        fr: "🤗 serrer quelqu'un dans ses bras"
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'user',
                description: 'The user you want to hug',
                name_localizations: {
                    fr: 'utilisateur'
                },
                description_localizations: {
                    fr: 'La personne à qui faire un câlin'
                },
                required: true
            },
        ]
    },
    async onInteraction(interaction) {
        const hasUser = interaction.options.getUser('user');
        const target = hasUser ?? interaction.guild?.members.cache.filter((member) => !member.user.bot).random();

        const sentence = `${interaction.user} viens de faire un câlin à ${target} 🤗`;

        return await interaction.reply({
            content: hasUser ? sentence : undefined,
            embeds: [
                EmbedUI.createMessage({
                    color: 'purple',
                    description: hasUser ? undefined : sentence,
                    image: {
                        url: await waifuAPI('hug')
                    }
                })
            ]
        })
    }
})