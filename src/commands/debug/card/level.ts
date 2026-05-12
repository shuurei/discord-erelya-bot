import { Command } from '@/core'

import { createNotifCard, levelUpCard } from '@/components/cards'
import { memberHelper, parseUserMention } from '@/utils'

export default new Command({
    access: {
        user: { isDeveloper: true }
    },
    async onMessage(message, { args: [userId, level, onlyAvatar] }) {
        const member = message.guild.members.cache.get(parseUserMention(userId) ?? message.author.id);

        if (!member) {
            return await message.reply({
                files: [
                    {
                        attachment: await createNotifCard({
                            theme: 'red',
                            text: 'Aucun membre trouvé.'
                        }),
                        name: 'Error.png'
                    }
                ]
            });
        }

        const helper = await memberHelper(member);

        level ??= '1';
        onlyAvatar = onlyAvatar === 'true';

        return await message.channel.send({
            files: [
                {
                    attachment: await levelUpCard({
                        username: helper.getName({ safe: true }),
                        avatarURL: helper.getAvatarURL(),
                        accentColor: onlyAvatar
                            ? await helper.getAvatarDominantColor({ hex: false })
                            : member.roles.color?.hexColor ?? await helper.getAvatarDominantColor({ hex: false }),
                        newLevel: level
                    }),
                    name: 'DebugLevelCard.png'
                }
            ]
        }).then(() => message.delete());
    }
});
