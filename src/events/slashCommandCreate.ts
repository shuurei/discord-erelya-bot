import { Event } from '@/core'

export default new Event({
    name: 'slashCommandCreate',
    async run({ events: [interaction] }) {
        const command = this.client.commands.resolveSlashCommand({
            commandName: interaction?.commandName,
            subcommandGroupName: interaction.options.getSubcommandGroup(false),
            subcommandName: interaction.options.getSubcommand(false),
        });

        if (command) {
            return this.client.emit('commandCreate', {
                command,
                messageOrInteraction: interaction,
            });
        };
    }
});
