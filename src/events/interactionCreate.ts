import { Event } from '@/core'

export default new Event({
    name: 'interactionCreate',
    async run({ events: [interaction] }) {
        if (interaction.isChatInputCommand()) {
            this.client.emit('slashCommandCreate', interaction);
        } else if (interaction.isButton()) {
            this.client.emit('buttonInteractionCreate', interaction);
        }
    }
});
