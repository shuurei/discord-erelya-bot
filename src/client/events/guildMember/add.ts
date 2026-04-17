import { Event } from '@/structures'
import { MessageFlags } from 'discord.js'

import { blacklistDerogationService, blacklistService } from '@/database/services'

import { ContainerUI, EmbedUI } from '@/ui'
import {
    createActionRow,
    createButton,
    createMediaGallery,
    createSeparator,
    createTextDisplay
} from '@/ui/components/common'
import { createNotifCard } from '@/ui/assets/cards/notifCard'

export default new Event({
    name: 'guildMemberAdd',
    async run({ events: [member] }) {
        const guild = member.guild;
        const guildId = guild.id;
        const userId = member.id;

        if (member.bannable && guild.safetyAlertsChannel) {
            const blacklist = await blacklistService.findById(userId);

            if (blacklist?.status === BlacklistStatus.TREATED) {
                const derogation = await blacklistDerogationService.findById({ userId, guildId });

                if (!derogation?.authorized) {
                    await member.ban({
                        reason: blacklist.reason ?? 'Aucune raisons spécifiée'
                    });

                    return await guild.safetyAlertsChannel.send({
                        flags: MessageFlags.IsComponentsV2,
                        files: [{
                            attachment: await createNotifCard({
                                text: `[Présence non autorisée détectée.]`,
                                theme: 'orange'
                            }),
                            name: 'info.png'
                        }],
                        components: [
                            createMediaGallery([{ media: { url: 'attachment://info.png' } }]),
                            ContainerUI.create({
                                color: 'orange',
                                components: [
                                    createTextDisplay([
                                        '### **Raison**',
                                        `> ${blacklist.reason ?? 'Aucune raison spécifiée'}`
                                    ].join('\n')),
                                    createSeparator(),
                                    createActionRow([
                                        createButton('Autoriser', { color: 'green', customId: `authorize_derogation.${userId}` }),
                                        createButton('Refuser', { color: 'red', customId: `refused_derogation.${userId}` })
                                    ])
                                ]
                            })
                        ]
                    });
                }
            }
        }

        if (process.env.ENV === 'DEV') return;

        if (this.client.mainGuild.id === guild.id) {
            return await this.client.mainGuild.welcomeChannel.send({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'indigo',
                        title: '˗ˏˋ ★ ˎˊ˗ Nouvelle invocation  ˗ˏˋ ★ ˎˊ˗',
                        description: [
                            `· · ─ ·✦· ─ · ·`,
                            `Bienvenue ${member} sur **Lunaria** !! ☆ ᶻ 𝗓 𐰁`,
                            `╰┈➤ J'espère que tu vas te plaire parmi nous ! :)`,
                            `Merci de lire le <#1282786070907584604> avant de discuter ! Merci ! ⋆｡°✩`,
                            `⁺⋆₊✧───────────✩₊⁺⋆☾⋆⁺₊✧───────────✩₊⁺⋆⁺`,
                        ].join('\n'),
                        thumbnail: {
                            url: member.user.avatarURL() ?? member.user.defaultAvatarURL,
                        },
                        image: {
                            url: 'https://i.pinimg.com/originals/cd/0a/c5/cd0ac53c65a93a2ccfabb720e1dcb0fe.gif'
                        },
                        timestamp: Date.now()
                    })
                ]
            }).then(async (msg) => await msg.react('🌠'))
        }
    }
});
