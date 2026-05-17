import { Command, FastComponent, FastContainer, FastEmbed, Gacha } from '@/core'
import { ApplicationCommandOptionType, GuildMember, MessageFlags } from 'discord.js'

import { BankProtectionService, MemberService } from '@/database/services'
import { BankProtectionRank, BankProtectionType } from '@/database/entities'
import { applicationEmojiHelperSync, MemberHelperSync, parseUserMention } from '@/utils'

const bankRankGacha = new Gacha({
    [BankProtectionRank.S]: 2,
    [BankProtectionRank.A]: 8,
    [BankProtectionRank.B]: 15,
    [BankProtectionRank.C]: 25,
    [BankProtectionRank.D]: 25,
    [BankProtectionRank.E]: 15,
    [BankProtectionRank.F]: 10,
});

const bankTypeGacha = new Gacha({
    [BankProtectionType.VAULT]: 35,
    [BankProtectionType.HEIST_DEFENSE]: 40,
    [BankProtectionType.SECURITY_TRAP]: 25,
});

const getRankFactor = (rank: BankProtectionRank) => {
    switch (rank) {
        case BankProtectionRank.S: return 4;
        case BankProtectionRank.A: return 3.5;
        case BankProtectionRank.B: return 3;
        case BankProtectionRank.C: return 2.5;
        case BankProtectionRank.D: return 2;
        case BankProtectionRank.E: return 1.5;
        case BankProtectionRank.F: return 1;
    }
}

const buildPayload = async (command: Command, member: GuildMember) => {
    const {
        coinsIconEmoji,
        shieldIconEmoji,
        rankAIconEmoji,
        rankBIconEmoji,
        rankDIconEmoji,
        rankCIconEmoji,
        rankEIconEmoji,
        rankFIconEmoji
    } = applicationEmojiHelperSync();

    const RANK = {
        [BankProtectionRank.S]: rankAIconEmoji,
        [BankProtectionRank.A]: rankAIconEmoji,
        [BankProtectionRank.B]: rankBIconEmoji,
        [BankProtectionRank.C]: rankCIconEmoji,
        [BankProtectionRank.D]: rankDIconEmoji,
        [BankProtectionRank.E]: rankEIconEmoji,
        [BankProtectionRank.F]: rankFIconEmoji
    } as const;

    const PROTECTION_EFFECTS = {
        [BankProtectionType.HEIST_DEFENSE]: (rank: BankProtectionRank) => {
            return `***Réduit les chances de réussite d'un braquage de \`${8 * getRankFactor(rank)}%\`***`
        },
        [BankProtectionType.VAULT]: (rank: BankProtectionRank) => {
            return `***Réduit les pertes subies lors d'un braquage de \`${5 * getRankFactor(rank)}%\`***`
        },
        [BankProtectionType.SECURITY_TRAP]: (rank: BankProtectionRank) => {
            return `***Le braqueur perd \`${(1.2 * getRankFactor(rank)).toPrecision(2)}%\` de ses pièces de serveur si le braquage échoue***`
        },
    } as const;

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
                                ? protections.map(({ rank, type }) => `> ${RANK[rank]} **|** ${PROTECTION_EFFECTS[type](rank)}`).join('\n')
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

                const rank = bankRankGacha.roll();
                const type = bankTypeGacha.roll(ownedTypes);

                if (rank && type) {
                    await BankProtectionService.add({ guildId, userId }, { rank, type });
                }

                return await interaction.update(await buildPayload(this, interaction.member));
            }

            case 'help': {
                return await interaction.reply({
                    flags: MessageFlags.Ephemeral,
                    embeds: [FastEmbed.create({
                        title: "C'est quoi la banque ?",
                        description: 'Help'
                    })]
                });
            }
        }
    }
});
