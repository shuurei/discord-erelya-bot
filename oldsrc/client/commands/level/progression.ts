import { Command } from '@/core/command'
import {
    APIEmbed,
    ApplicationCommandOptionType,
    GuildFeature,
    GuildMember
} from 'discord.js'

import { createProgressBar } from '@/ui/components'
import { EmbedUI } from '@/ui'

import { guildMemberHelper } from '@/helpers'
import {
    getDominantColor,
    parseUserMention,
    timeElapsedFactor,
    xpToNextLevel
} from '@/utils'
import { createBoostLine } from '@/ui/components/createBoostLine'
import { MemberService, UserService } from '@/database/services'

const makePayload = (embed: APIEmbed) => ({
    allowedMentions: {},
    embeds: [embed],
});

const buildPayload = async (member: GuildMember) => {
    const memberHelper = await guildMemberHelper(member);

    if (member.user.bot) {
        return makePayload(EmbedUI.createErrorMessage({
            title: `${memberHelper.getName({ safe: true })} — Expérience`,
            description: `Les bots ne possèdent pas de progression d'XP ni de rang dans le classement`
        }));
    }

    const userId = member.id;
    const guild = member.guild;
    const guildId = guild.id;

    const memberAvatar = memberHelper.getAvatarURL();

    const [
        avatarDominantColor,
        memberData,
        leaderboard,
        user,
        // guildLevelModule
    ] = await Promise.all([
        getDominantColor(memberAvatar),
        MemberService.findOrCreate({ userId, guildId }),
        MemberService.getActivityXpRank({ userId, guildId }),
        UserService.findById(userId),
        // guildModuleService.findOrCreate({
        // guildId,
        // moduleName: 'level'
        // })
    ]);

    const activityXp = memberData?.activityXp ?? 0;

    const tagSupporterFactor = 0.3;
    // const tagSupporterFactor = guildLevelModule.settings.tagSupporterFactor;

    const {
        currentXp,
        currentLevel,
        nextLevel,
        xpProgress,
        xpForLevel
    } = xpToNextLevel(activityXp)

    const tagBoostPercent = (timeElapsedFactor(user?.tagAssignedAt, 14) * tagSupporterFactor) * 100
    const guildHasTag = guild.features.find((f) => f === GuildFeature.GuildTags);

    const fields = [
        {
            name: 'Niveau',
            value: `**${currentLevel.toLocaleString('en')}** ➜ **${nextLevel.toLocaleString('en')}**`,
            inline: true
        },
        {
            name: 'Progression',
            value: [
                createProgressBar(Math.max(0, xpProgress / xpForLevel), { length: 7, asciiChar: true, showPercentage: true }),
                `**${xpProgress.toLocaleString('en')}** / **${xpForLevel.toLocaleString('en')}** XP`
            ].join('\n'),
            inline: true
        },
        {
            name: 'Rang',
            value: activityXp > 0
                ? `**${leaderboard.rank.toLocaleString('en')}** / **${leaderboard.total.toLocaleString('en')}**`
                : 'Non Classé',
            inline: true
        },
        {
            name: "Total d'XP",
            value: currentXp.toLocaleString('en')
        },
    ];

    if (tagBoostPercent || tagSupporterFactor) {
        fields.push({
            name: 'Boosts',
            value: [
                (tagSupporterFactor && guildHasTag) && '- '.concat(createBoostLine({
                    label: 'Tag du serveur',
                    value: tagBoostPercent,
                    max: tagSupporterFactor * 100,
                    arrowColor: 'green'
                })),
            ].filter(Boolean).join('\n ')
        })
    }

    const embed = EmbedUI.create({
        color: avatarDominantColor,
        thumbnail: { url: memberAvatar },
        title: `${memberHelper.getName({ safe: true })} — Expérience`,
        description: '> 💡 Seuls les membres avec de l’XP sont pris en compte dans le classement !',
        fields,
        footer: {
            iconURL: member.guild.iconURL() ?? undefined,
            text: member.guild.name
        },
        timestamp: Date.now()
    });

    return makePayload(embed);
};

export default new Command({
    description: "🧪 Display a member's progression",
    descriptionLocalizations: {
        fr: "🧪 Afficher la progression d'un membre"
    },
    access: {
        guild: {
            modules: {
                level: true
            }
        }
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
        await interaction.deferReply();

        const member = interaction.options.getMember('member') ?? interaction.member;

        return await interaction.editReply(await buildPayload(member));
    },
    async onMessage(message, { args: [userId] }) {
        const member = userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member;

        if (member) {
            return await message.reply(await buildPayload(member));
        }
    }
});
