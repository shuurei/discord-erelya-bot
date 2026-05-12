import { MemberService } from '@/database/services/Member'
import { ModuleService } from '@/database/services/ModuleService'
import { Command } from '@/core/command'
import { EmbedUI } from '@/ui'
import { jsonToMarkdown } from '@/utils'

const validModules = [
    'level',
    'economy'
];

export default new Command({
    access: {
        user: {
            isDeveloper: true
        }
    },
    async onMessage(message, { args: [moduleName, guildId] }) {
        guildId ??= message.guild.id;

        if (!moduleName || !validModules.includes(moduleName)) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage({
                        title: 'Module invalide',
                        description: [
                            `Liste des modules valide :`,
                            validModules.map((name) => `- \`${name}\``).join('\n')
                        ].join('\n')
                    })
                ]
            });
        }

        // const x = await ModuleService.updateOrCreate(guildId, 'economy', {
        //     // callCameraBonus: Math.floor(Math.random() * 1000)
        //     robCooldown: Math.floor(Math.random() * 1000)
        // });

        // const x = await ModuleService.toggleModule(guildId, 'economy');

        const x = await ModuleService.findMany(guildId, [ 'economy', 'level' ]);

        return message.reply(jsonToMarkdown(x).slice(0, 2000));
    }
});
