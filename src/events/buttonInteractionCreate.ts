import { CommandButtonInteraction, Event, FastEmbed } from '@/core'
import { MessageFlags } from 'discord.js'

export default new Event({
    name: 'buttonInteractionCreate',
    async run({ events: [interaction] }) {
        if (!interaction.inCachedGuild()) return;

        const [commandId, authorId, customId] = interaction.customId.split('#'); 
        const [commandName, subcommandGroupName, subcommandName] = commandId.split('.');

        const command = this.client.commands.resolveSlashCommand({
            commandName,
            subcommandGroupName: subcommandName,
            subcommandName: subcommandGroupName,
        });

        if (command && command.onButton) {
            if (customId === 'help' || authorId === interaction.user.id) {
                const customInteraction = interaction as CommandButtonInteraction;

                customInteraction.invokerId = authorId;
                customInteraction.originalCustomId = interaction.customId;
                customInteraction.customId = customId;
    
                return await command.onButton(customInteraction);
            } else {
                return await interaction.reply({
                    flags: MessageFlags.Ephemeral,
                    embeds: [FastEmbed.createErrorMessage(`Vous n'êtes pas autorisé à appuyer sur ce bouton !`)]
                });
            }
        }
    }
});