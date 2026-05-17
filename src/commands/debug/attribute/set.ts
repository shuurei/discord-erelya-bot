import { parseUserMention, toCapitalize } from '@/utils'
import { Command, FastEmbed } from '@/core'
import { MemberService } from '@/database/services'

const validAttributes = [
    'level',
    'activityXp',
    'guildCoins'
];

export default new Command({
    access: {
        user: { isDeveloper: true }
    },
    async onMessage(message, { args: [attribute, amount, userId, guildId] }) {
        userId = parseUserMention(userId) ?? userId ?? message.author.id;
        guildId ??= message.guild.id;

        if (!attribute || !validAttributes.includes(attribute)) {
            return await message.reply({
                embeds: [
                    FastEmbed.createErrorMessage({
                        title: 'Attribut invalide',
                        description: [
                            `Liste des attributs valide :`,
                            validAttributes.map((name) => `- \`${name}\``).join('\n')
                        ].join('\n')
                    })
                ]
            });
        }

        if (!amount) {
            return await message.reply({
                embeds: [
                    FastEmbed.createErrorMessage({
                        title: 'Montant invalide',
                        description: `Vous souhaitez définir l'attribut \`${attribute}\` à quel montant ?`
                    })
                ]
            });
        }

        const setter = (MemberService as any)[`set${toCapitalize(attribute)}`].bind(MemberService);

        await setter({ guildId, userId }, parseInt(amount));

        return await message.channel.send(`Redéfinition de l'attribut \`${attribute}\` pour <@${userId}> à **${amount}**`);
    }
});
