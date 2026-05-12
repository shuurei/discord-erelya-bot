import { guildModuleService } from '@/database/services'
import { defaultGuildModuleSettings } from '@/database/utils'
import { Command } from '@/core/command'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Command({
    access: {
        user: {
            isDeveloper: true
        }
    },
    messageCommand: {
        style: 'slashCommand'
    },
    async onMessage(message, { args: [moduleName] }) {
        if (!moduleName) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Euh.. Je crois que tu as oublié de mettre le nom du module que tu veux toggle hehe..`)
                ]
            });
        }

        if (!(moduleName in defaultGuildModuleSettings)) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Mhh.. Je ne trouves pas de module avec ce nom, t'es certain d'avoir utilisé le bon nom ? 🤔`)
                ]
            });
        }

        const { isActive } = await guildModuleService.toggleEnabled({
            guildId: message.guild.id,
            moduleName: moduleName as any
        });

        return await message.reply({
            embeds: [
                EmbedUI.createSuccessMessage({
                    title: `🔍 Debug - Toggle d'un module de serveur`,
                    description: `C'est good, j'ai **${isActive ? 'activé' : 'désactivé'}** ton module !`
                })
            ]
        });
    }
});
