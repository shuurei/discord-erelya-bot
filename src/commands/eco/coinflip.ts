import { Command } from '@/core'

export default new Command({
    description: '🎰 Execute a coin flip to wager guild coins',
    descriptionLocalizations: {
        fr: '🎰 Lancez une pièce pour miser des pièces du serveur'
    },
    slashCommand: {
        arguments: [
            {
                type: 3,
                name: 'amount',
                description: 'The amount to wager or " max "',
                description_localizations: {
                    fr: 'Le montant à miser ou " max "'
                },
                required: true
            }
        ]
    },
    async onInteraction(interaction) {

    },
    async onMessage(message, { args: [amount] }) {

    }
})
