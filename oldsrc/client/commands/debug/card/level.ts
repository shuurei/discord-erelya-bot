import { guildMemberHelperSync } from '@/helpers'
import { Command } from '@/core/command'
import { getDominantColor, parseUserMention } from '@/utils'
import { levelUpCard } from '@/ui/assets/cards/levelUpCard'

export default new Command({
    access: {
        user: {
            isDeveloper: true
        }
    },
    async onMessage(message, { args: [userId] }) {
        const member = await message.guild.members.fetch(parseUserMention(userId) ?? message.author.id)
        const helper = guildMemberHelperSync(member);

        return await message.channel.send({
            allowedMentions: {
                roles: [],
                users: [message.author.id],
                repliedUser: true
            },
            files: [
                {
                    attachment: await levelUpCard({
                        username: helper.getName({ safe: true }),
                        avatarURL: helper.getAvatarURL(),
                        accentColor:
                            member.roles.color?.hexColor ??
                            await getDominantColor(helper.getAvatarURL(), { returnRGB: false }),
                        newLevel: '??'
                    }),
                    name: 'debug-level-up-card.png'
                }
            ]
        }).then(() => message.delete());
    }
});
