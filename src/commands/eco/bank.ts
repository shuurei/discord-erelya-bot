import { Command, FastComponent, FastContainer, FastEmbed } from '@/core'
import { ApplicationCommandOptionType, GuildMember, MessageFlags } from 'discord.js'

import { BankProtectionService, MemberService } from '@/database/services'
import { BankProtectionRank, BankProtectionType } from '@/database/entities'
import { applicationEmojiHelperSync, MemberHelperSync, parseUserMention } from '@/utils'
import { bankRankTable, bankTypeTable, getBankRankFactor } from '@/data/tables/bank'
import { bankProtectionTypeValues } from '@/data/values/bank'

const buildRankEmojiMap = (emojis: ReturnType<typeof applicationEmojiHelperSync>) => {
    const {
        rankXIconEmoji,
        rankSIconEmoji,
        rankAIconEmoji,
        rankBIconEmoji,
        rankDIconEmoji,
        rankCIconEmoji,
        rankEIconEmoji,
        rankFIconEmoji
    } = emojis;

    return {
        [BankProtectionRank.X]: rankXIconEmoji,
        [BankProtectionRank.S]: rankSIconEmoji,
        [BankProtectionRank.A]: rankAIconEmoji,
        [BankProtectionRank.B]: rankBIconEmoji,
        [BankProtectionRank.C]: rankCIconEmoji,
        [BankProtectionRank.D]: rankDIconEmoji,
        [BankProtectionRank.E]: rankEIconEmoji,
        [BankProtectionRank.F]: rankFIconEmoji
    } as const;
}

const protectionEffects = {
    [BankProtectionType.HEIST_DEFENSE]: (rank: BankProtectionRank) => {
        return `***Réduit les chances de réussite d'un braquage de \`${bankProtectionTypeValues.HEIST_DEFENSE * getBankRankFactor(rank)}%\`***`
    },
    [BankProtectionType.STASH]: (rank: BankProtectionRank) => {
        return `***Réduit les pertes subies lors d'un braquage de \`${bankProtectionTypeValues.STASH * getBankRankFactor(rank)}%\`***`
    },
    [BankProtectionType.ALARM]: (rank: BankProtectionRank) => {
        return `***Le braqueur perd \`${(bankProtectionTypeValues.ALARM * getBankRankFactor(rank)).toPrecision(2)}%\` de ses pièces de serveur si le braquage échoue***`
    },
} as const;

export const protectionTypeLabels = {
    [BankProtectionType.HEIST_DEFENSE]: 'Défense',
    [BankProtectionType.STASH]: 'Planque',
    [BankProtectionType.ALARM]: 'Alarme',
} as const;

const buildPayload = async (command: Command, member: GuildMember) => {
    const { coinsIconEmoji, shieldIconEmoji, ...emojis } = applicationEmojiHelperSync();
    const rankEmojis = buildRankEmojiMap(emojis);

    const helper = MemberHelperSync(member);
    const guild = member.guild;

    const [protections, { guildCoins }] = await Promise.all([
        BankProtectionService.getAll({ guildId: guild.id, userId: member.id }),
        MemberService.findOrCreate({ guildId: guild.id, userId: member.id })
    ]);

    return {
        flags: MessageFlags.IsComponentsV2,
        components: [FastContainer.create({
            color: await helper.getAvatarDominantColor(),
            components: [
                FastComponent.createSection({
                    accessory: FastComponent.createButton({ name: '❔' }, { customId: { id: 'help', invokerId: member.id, commandId: command.id }, color: 'Gray' }),
                    components: [
                        FastComponent.createTextDisplay(`## Banque de ${helper.getName({ safe: true })}`),
                    ]
                }),
                FastComponent.createSection({
                    accessory: FastComponent.createThumbnail({ url: helper.getAvatarURL() }),
                    components: [
                        FastComponent.createTextDisplay('> 💡 Ici sont stockés tous les pièces de serveur que vous avez accumulés'),
                        FastComponent.createTextDisplay([
                            `### - ${coinsIconEmoji} **Pièce de serveur**`,
                            `> \`${guildCoins.toLocaleString('en')}\``,
                        ].join('\n'))
                    ]
                }),
                FastComponent.createSection({
                    accessory: protections.length < 2
                        ? FastComponent.createButton(`Renforcer (20k)`, { color: 'Green', customId: { id: 'buy', invokerId: member.id, commandId: command.id } })
                        : FastComponent.createButton('MAX', { color: 'Gray', customId: false, disabled: true }),
                    components: [
                        FastComponent.createTextDisplay([
                            `### - ${shieldIconEmoji} **Protection (${protections.length}/2)**`,
                            protections.length > 0
                                ? protections.map(({ rank, type }) => `> ${rankEmojis[rank]} **|** ${protectionEffects[type](rank)}`).join('\n')
                                : '> *Aucune protection*'
                        ].join('\n'))
                    ]
                }),
            ]
        })]
    } as const;
}

export default new Command({
    nameLocalizations: {
        fr: 'banque'
    },
    description: '💳 View your bank account',
    descriptionLocalizations: {
        fr: '💳 Consulte ton compte bancaire'
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
    access: {
        guild: {
            modules: {
                economy: { enabled: true }
            }
        }
    },
    async onInteraction(interaction) {
        await interaction.deferReply();

        const member = interaction.options.getMember('member') ?? interaction.member;

        return await interaction.editReply(await buildPayload(this, member));
    },
    async onMessage(message, { args: [userId] }) {
        const member = userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member;

        if (member) {
            return await message.reply(await buildPayload(this, member));
        }
    },
    async onButton(interaction) {
        switch (interaction.customId) {
            case 'buy': {
                const guildId = interaction.guild.id;
                const userId = interaction.user.id;

                const protections = await BankProtectionService.getAll({ guildId, userId });
                const ownedTypes = protections.map(({ type }) => type);

                const rank = bankRankTable.roll();
                const type = bankTypeTable.roll(ownedTypes);

                if (rank && type) {
                    await BankProtectionService.add({ guildId, userId }, { rank, type });
                }

                return await interaction.update(await buildPayload(this, interaction.member));
            }

            case 'help': {
                const rankEmojis = buildRankEmojiMap(applicationEmojiHelperSync());

                return await interaction.reply({
                    flags: MessageFlags.Ephemeral,
                    embeds: [FastEmbed.create({
                        color: 'indigo',
                        title: "Système de la banque",
                        description: [
                            "La banque conserve vos pièces de serveur et peut être renforcée avec jusqu'à **2 protections** ! Chaque protection possède un **rang** (de F à X) et un **type** qui détermine son effet :",
                            "- 🛡️ **Défense**: Réduit les chances qu'un braquage réussisse",
                            '- 🏠 **Planque**: Réduit les pertes si un braquage réussit',
                            "- ⏰ **Alarme**: Pénalise le braqueur en cas d'échec",
                            "Plus le rang est élevé, plus l'effet est puissant. Les protections sont obtenues aléatoirement via le bouton **renforcer**"
                        ].join('\n'),
                        fields: [
                            {
                                name: 'Rang probabilité',
                                value: Object.entries(bankRankTable.odds()).map(([rank, chance]) => `> ${(rankEmojis as any)[rank]} \`${chance}%\``).join('\n'),
                                inline: true
                            },
                            {
                                name: 'Type probabilité',
                                value: Object.entries(bankTypeTable.odds()).map(([type, chance]) => `> **${(protectionTypeLabels as any)[type]}** \`${chance}%\``).join('\n'),
                                inline: true
                            }
                        ]
                    })]
                });
            }
        }
    }
});
