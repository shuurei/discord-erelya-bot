import { Command } from '@/core/command'

import {
    guildModuleService,
    memberService,
    memberVaultService,
    tierCapacity
} from '@/database/services'
import { userService } from '@/database/services'

import { ApplicationCommandOptionType, MessageFlags } from 'discord.js'

import { ContainerUI } from '@/ui'
import {
    createButton,
    createSection,
    createSeparator,
    createTextDisplay
} from '@/ui/components/common'

import { applicationEmojiHelper } from '@/helpers'
import { formatCompactNumber, timeElapsedFactor } from '@/utils'

export default new Command({
    nameLocalizations: {
        fr: 'améliorer'
    },
    description: '🛠️ Upgrade your economy features',
    descriptionLocalizations: {
        fr: '🛠️ Améliorer différents éléments liés à l’économie'
    },
    access: {
        guild: {
            modules: {
                eco: true
            }
        }
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.String,
                name: 'type',
                description: 'Type d’amélioration',
                choices: [
                    {
                        name: 'Vault',
                        name_localizations: { fr: 'Coffre-Fort' },
                        value: 'vault'
                    }
                ],
                required: true
            }
        ]
    },
    async onInteraction(interaction) {
        const { whiteArrowEmoji } = applicationEmojiHelper();

        const upgradeType = interaction.options.getString('type');

        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        const guildEcoModule = await guildModuleService.findById({
            guildId,
            moduleName: 'eco'
        });

        switch (upgradeType) {
            case 'vault': {
                const userDatabase = await userService.findById(userId);
                const baseNextTier = await memberVaultService.getNextTier({ userId, guildId });
                const memberGuildPoints = await memberService.getTotalGuildCoins({ userId, guildId });

                const discount = timeElapsedFactor(userDatabase?.tagAssignedAt, 14) * (guildEcoModule?.settings?.tagUpgradeDiscount ?? 0);

                const nextTier = baseNextTier
                    ? {
                        ...baseNextTier,
                        baseCost: baseNextTier.cost,
                        cost: Math.floor(baseNextTier.cost * (1 - discount))
                    }
                    : null;

                const loadComponents = async () => {
                    const userDatabase = await userService.findById(userId);
                    const memberGuildPoints = await memberService.getTotalGuildCoins({ userId, guildId });
                    const memberVault = await memberVaultService.findById({ userId, guildId });
                    const baseNextTier = await memberVaultService.getNextTier({ userId, guildId });
                    const discount = timeElapsedFactor(userDatabase?.tagAssignedAt, 14) * (guildEcoModule?.settings?.tagUpgradeDiscount ?? 0);

                    const nextTier = baseNextTier
                        ? {
                            ...baseNextTier,
                            baseCost: baseNextTier.cost,
                            cost: Math.floor(baseNextTier.cost * (1 - discount))
                        }
                        : null;

                    const currentTierLevel = memberVault.capacityTier.split('_')[1] ?? '?';

                    const upgradeButton = nextTier
                        ? createButton('Améliorer', {
                            color: 'green',
                            customId: 'upgrade',
                            disabled: nextTier.cost > memberGuildPoints.total
                        })
                        : createButton('MAX', 'upgrade', { color: 'gray', disabled: true });

                    const currentMaxCapacity = tierCapacity[memberVault.capacityTier]?.guildCoins?.capacity;

                    return [
                        ContainerUI.create({
                            color: 'orange',
                            components: [
                                createTextDisplay('## Amélioration de la banque'),
                                createTextDisplay("> 💡 Améliorer la banque permet d'augmenter la capacité d'argent maximum"),
                                createSeparator(),
                                createSection({
                                    accessory: upgradeButton,
                                    components: [
                                        createTextDisplay(`## **Nv. ${currentTierLevel}**`),
                                        createTextDisplay([
                                            nextTier && `💰 Coût ${whiteArrowEmoji} ${discount
                                                ? `~~${formatCompactNumber(nextTier.baseCost)}~~ **${formatCompactNumber(nextTier.cost)} -${(discount * 100).toFixed(2)}%**`
                                                : `**${formatCompactNumber(nextTier.baseCost)}**`}`,
                                            nextTier
                                                ? `📦 Capacité ${whiteArrowEmoji} **${formatCompactNumber(currentMaxCapacity)}** ➜ **${formatCompactNumber(nextTier.capacity.guildCoins.capacity)}**`
                                                : `📦 Capacité ${whiteArrowEmoji} **${formatCompactNumber(currentMaxCapacity)}**`
                                        ].filter(Boolean).join('\n')),
                                    ]
                                }),
                            ]
                        })
                    ];
                };

                const msg = await interaction.reply({
                    flags: MessageFlags.IsComponentsV2,
                    components: await loadComponents()
                });

                if (!nextTier || nextTier.cost > memberGuildPoints.total) return;

                const collector = msg.createMessageComponentCollector({
                    filter: (i) => i.user.id === userId,
                    time: 60_000
                });

                collector.on('collect', async (i) => {
                    collector.resetTimer();

                    await memberVaultService.upgradeTier({ userId, guildId });
                    await memberService.removeGuildCoinsWithVault({ userId, guildId }, nextTier.cost);

                    return await i.update({ components: await loadComponents() });
                });

                collector.on('end', async () => {
                    await msg.edit({
                        components: [
                            ContainerUI.create({
                                color: 'orange',
                                components: [createTextDisplay('⏳ Temps écoulé')]
                            })
                        ]
                    });
                });

                break;
            }

            default: {
                return await interaction.reply({
                    content: '❓ Type d’amélioration invalide',
                    ephemeral: true
                })
            }
        }
    }
})
