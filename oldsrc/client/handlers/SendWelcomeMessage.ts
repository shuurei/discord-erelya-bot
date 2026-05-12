import { Guild, User } from 'discord.js'
import { EmbedUI } from '@/ui'

/** @deprecated */
export const buildWelcomeMessagePayload = (guild: Guild, user: User) => {
    return {
        embeds: [
            EmbedUI.createMessage({
                color: 12058541,
                title: '˗ˏˋ ★ ˎˊ˗ Nouvelle invocation  ˗ˏˋ ★ ˎˊ˗',
                description: [
                    `· · ─ ·✦· ─ · ·`,
                    `Bienvenue ${user} sur **${guild.name}** !! ☆`,
                    `╰┈➤ J'espère que tu vas te plaire parmi nous ! :)`,
                    `Merci de lire le ${guild.rulesChannel} avant de discuter ! Merci ! ⋆｡°✩`,
                    `⁺⋆₊✧───────────✩₊⁺⋆ ☾ ⋆⁺₊✧───────────✩₊⁺⋆⁺`,
                ].join('\n'),
                thumbnail: {
                    url: user.avatarURL() ?? user.defaultAvatarURL,
                },
                image: {
                    url: 'https://i.pinimg.com/originals/a7/84/0b/a7840b46505ca8d532a91dc824b52b82.gif'
                },
                timestamp: Date.now()
            })
        ]
    }
}