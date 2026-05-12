import { Command } from '@/core/command'
import { CustomClient } from '@/structures'

import { ApplicationCommandOptionType, GuildMember } from 'discord.js'

import { EmbedUI } from '@/ui'

import { MemberService } from '@/database/services/Member'

import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import { getDominantColor, parseUserMention } from '@/utils'

const formatTime = (minutes: number) => {
    if (!minutes) return '**0** min';

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return h > 0
        ? m > 0
            ? `**${h.toLocaleString('en')}** heures et **${m}** min`
            : `**${h.toLocaleString('en')}** heures`
        : `**${m}** min`;
};

const buildPayload = async ({ client, member }: {
    client: CustomClient;
    member: GuildMember;
}) => {
    const { whiteArrowEmoji } = applicationEmojiHelper();

    if (client.callSessions.cache.has(member.user.id)) {
        await client.callSessions.flush(member.user.id, member.guild.id);
    }

    const memberHelper = await guildMemberHelper(member);

    const [
        avatarDominantColor,
        dbUser
    ] = await Promise.all([
        getDominantColor(memberHelper.getAvatarURL({ extension: 'png' })),
        MemberService.findOrCreate({ guildId: member.guild.id, userId: member.user.id })
    ]);

    const {
        messageCount = 0,
        callPublicMinutes = 0,
        callPrivateMinutes = 0,
        callActiveMinutes = 0,
        callDeafMinutes = 0,
        callMutedMinutes = 0,
        callStreamingMinutes = 0,
        callCameraMinutes = 0,
    } = dbUser ?? {};

    const embed = EmbedUI.create({
        color: avatarDominantColor,
        description: `> 💡 Voici un résumé de votre activité sur le serveur !`,
        thumbnail: {
            url: memberHelper.getAvatarURL()
        },
        title: `${memberHelper.getName({ safe: true })} — Serveur Stats`,
        fields: [
            {
                name: '💬 Messages envoyés',
                value: `- ✨ **Total** ${whiteArrowEmoji} **${messageCount.toLocaleString('en')}**`
            },
            {
                name: '🔊 Temps en vocal',
                value: [
                    `- 🌐 **Public** ${whiteArrowEmoji} ${formatTime(callPublicMinutes)}`,
                    `- 🔒 **Privé** ${whiteArrowEmoji} ${formatTime(callPrivateMinutes)}`,
                    `- 🎙️ **Actif** ${whiteArrowEmoji} ${formatTime(callActiveMinutes)}`,
                    `- 🙊 **Muté** ${whiteArrowEmoji} ${formatTime(callMutedMinutes)}`,
                    `- 🙉 **Sourdine** ${whiteArrowEmoji} ${formatTime(callDeafMinutes)}`,
                    `- 🎥 **Stream** ${whiteArrowEmoji} ${formatTime(callStreamingMinutes)}`,
                    `- 📹 **Caméra** ${whiteArrowEmoji} ${formatTime(callCameraMinutes)}`,
                    `- ✨ **Total** ${whiteArrowEmoji} ${formatTime(callActiveMinutes + callMutedMinutes + callDeafMinutes)}`
                ].join('\n')
            }
        ],
        footer: {
            iconURL: member.guild.iconURL() ?? undefined,
            text: member.guild.name,
        },
        timestamp: Date.now()
    });

    return {
        allowedMentions: {},
        embeds: [embed],
    } as const;
}

export default new Command({
    description: "📊 Retrieves a user's stats",
    descriptionLocalizations: {
        fr: "📊 Récupère les stats d'un utilisateur"
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'member',
                name_localizations: {
                    fr: 'membre'
                },
                description_localizations: {
                    fr: 'membre'
                }
            }
        ]
    },
    async onInteraction(interaction) {
        const member = interaction.options.getMember('member') ?? interaction.member;

        return await interaction.reply(await buildPayload({ client: this.client, member }));
    },
    async onMessage(message, { args: [userId] }) {
        const member = userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member;

        if (member) {
            return await message.reply(await buildPayload({ client: this.client, member }));
        }
    }
});
