import { Command } from '@/core'
import { ApplicationCommandOptionType } from 'discord.js'

export default new Command({
    description: '💸 Send server coins to another user',
    nameLocalizations: {
        fr: 'virement'
    },
    descriptionLocalizations: {
        fr: '💸 Faire un virement des pièces du serveur à un autre joueur'
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'The member you want to pay',
                description_localizations: {
                    fr: 'Le membre à qui vous voulez faire le virement '
                },
                required: true
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'amount',
                description: 'The amount to pay or " all "',
                description_localizations: {
                    fr: 'Le montant du virement ou " all "'
                },
                required: true
            },
        ]
    },
    async onInteraction(interaction) {

    },
    async onMessage(message) {
    }
})