import { Command, FastComponent, FastEmbed } from '@/core'
import { ApplicationCommandOptionType, GuildMember } from 'discord.js'


import { MemberService, ModuleService } from '@/database/services'

import { formatMedalRank, levelToXp, memberHelper, parseUserMention, xpToNextLevel } from '@/utils'
import { createProgressBar } from '@/components'

const buildPayload = async (member: GuildMember) => {
    const helper = await memberHelper(member);

    if (member.user.bot) {
        return {
            embeds: [FastEmbed.createErrorMessage({
                title: `Niveau de ${helper.getName({ safe: true })}`,
                description: `Les robots ne possèdent pas de progression d'XP ni de rang dans le classement !`
            })]
        };
    }

    const userId = member.id;
    const guild = member.guild;
    const guildId = guild.id;

    const [memberDatabase, leaderboard, { maxLevel }] = await Promise.all([
        MemberService.findOrCreate({ guildId, userId }),
        MemberService.getActivityXpRank({ guildId, userId }),
        ModuleService.findOrCreate(guildId, 'level'),
    ]);

    const activityXp = memberDatabase.activityXp ?? 0;

    const { currentXp, currentLevel, nextLevel, xpProgress, xpForLevel } = xpToNextLevel(activityXp);

    const isLastLevel = maxLevel >= nextLevel;
    const maxLevelReached = currentLevel >= maxLevel;

    const fields = [
        {
            name: maxLevelReached ? 'Niveau max' : 'Niveau',
            value: maxLevelReached
                ? `**${maxLevel}**`
                : `**${currentLevel.toLocaleString('en')}** ➜ **${isLastLevel ? 'MAX' : nextLevel.toLocaleString('en')}**`,
            inline: true
        },
    ];

    if (maxLevelReached) {
        fields.push({
            name: "Total d'XP",
            value: levelToXp(maxLevel).toLocaleString('en'),
            inline: true
        });
    } else {
        fields.push({
            name: 'Progression',
            value: [
                createProgressBar(Math.max(0, xpProgress / xpForLevel), { length: 7, asciiChar: true, showPercentage: true }),
                `**${xpProgress.toLocaleString('en')}** / **${xpForLevel.toLocaleString('en')}** XP`
            ].join('\n'),
            inline: true
        });
    }

    fields.push({
        name: 'Rang',
        value: activityXp > 0 && leaderboard.total > 5
            ? `**${formatMedalRank(leaderboard.rank)}** / **${leaderboard.total.toLocaleString('en')}**`
            : '*Non Classé*',
        inline: true
    })

    if (!maxLevelReached) {
        fields.push({
            name: "Total d'XP",
            value: currentXp.toLocaleString('en'),
            inline: false
        });
    }

    return {
        embeds: [FastEmbed.create({
            color: await helper.getAvatarDominantColor(),
            thumbnail: { url: helper.getAvatarURL() },
            title: `Niveau de ${helper.getName({ safe: true })}`,
            description: '> 💡 Seuls les membres avec de l’XP sont pris en compte dans le classement !',
            fields,
            footer: {
                iconURL: guild.iconURL() ?? undefined,
                text: guild.name
            },
            timestamp: Date.now()
        })]
    } as const;
};

export default new Command({
    description: "🧪 Display a member's progression",
    descriptionLocalizations: {
        fr: "🧪 Afficher la progression d'un membre"
    },
    access: {
        guild: {
            modules: {
                level: {
                    enabled: true
                }
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
