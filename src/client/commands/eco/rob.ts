import { ApplicationCommandOptionType, MessageFlags } from 'discord.js'
import { Command } from '@/structures/Command'

import db from '@/database/db'
import { guildModuleService, memberService } from '@/database/services'

import { createCooldown, formatTimeLeft } from '@/utils'
import { createNotifCard } from '@/ui/assets/cards/notifCard'

export default new Command({
    nameLocalizations: {
        fr: 'voler'
    },
    description: '🕵️ Attempt to steal coins from another player',
    descriptionLocalizations: {
        fr: '🕵️ Tenter de voler des pièces à un autre joueur'
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'target',
                name_localizations: {
                    fr: 'cible'
                },
                description: 'The member you want to rob',
                description_localizations: {
                    fr: 'Le membre que vous voulez voler'
                },
                required: true
            },
        ],
    },
    messageCommand: {
        style: 'flat',
    },
    access: {
        guild: {
            modules: {
                eco: {
                    isRobEnabled: true
                }
            }
        }
    },
    async onInteraction(interaction) {
        const targetUser = interaction.options.getUser('target', true);
        const robberId = interaction.user.id;
        const guildId = interaction.guild.id;

        const robberKey = {
            userId: robberId,
            guildId,
        }

        if (targetUser.bot) {
            return interaction.reply({
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `[la cible sélectionnée ne répond pas aux critères d’interaction.]`,
                            fontSize: 24,
                        }),
                        name: 'infoCard.png'
                    }
                ],
            });
        }

        if (targetUser.id === robberId) {
            return interaction.reply({
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `[une tentative d’interaction avec soi-même a été détectée. Action annulée.]`,
                            fontSize: 24,
                        }),
                        name: 'infoCard.png'
                    }
                ],
            });
        }

        let robber = await memberService.findOrCreate(robberKey);
        const { settings: ecoSettings } = await guildModuleService.findOrCreate({
            guildId,
            moduleName: 'eco'
        });

        const { isActive: canRob, expireTimestamp } = createCooldown(robber.lastRobAt, ecoSettings.robCooldown);
        if (canRob) {
            return await interaction.reply({
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `[${formatTimeLeft(expireTimestamp, { withMarkdown: false })} restantes avant la prochaine tentative autorisée.]`,
                            fontSize: 24,
                        }),
                        name: 'infoCard.png'
                    }
                ],
            });
        }

        const targetKey = {
            userId: targetUser.id,
            guildId
        }

        const target = await memberService.findOrCreate(targetKey);

        if (!target.guildCoins) {
            return await interaction.reply({
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `[la cible ne possède aucune pièce de serveur.]`,
                            fontSize: 24,
                        }),
                        name: 'infoCard.png'
                    }
                ],
            });
        }

        const { isActive: isAlreadyRobbed } = createCooldown(target.lastRobbedAt, ecoSettings.robbedCooldown);
        if (isAlreadyRobbed) {
            return await interaction.reply({
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `[la cible est sous protection temporaire. Les pièces de serveur ne peuvent pas être ciblées.]`,
                            fontSize: 24,
                        }),
                        name: 'infoCard.png'
                    }
                ],
            });
        }

        const success = Math.random() < (ecoSettings.robSuccessChance);

        await memberService.setLastRobAt(robberKey);
        await memberService.setLastRobbedAt(targetKey);

        if (success) {
            const stolenAmount = Math.floor(target.guildCoins * ecoSettings.robStealPercentage);

            await db.$transaction(async (tx) => {
                const ctx = Object.create(memberService, {
                    model: { value: tx.member }
                });

                await memberService.addGuildCoins.call(ctx, robberKey, stolenAmount);
                await memberService.removeGuildCoins.call(ctx, targetKey, stolenAmount);
            });

            return await interaction.reply({
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `[l'interaction a réussi. Vous avez volé ${stolenAmount.toLocaleString('en')} pièces ont été transférées vers votre inventaire.]`,
                            fontSize: 24,
                            theme: 'green'
                        }),
                        name: 'successCard.png'
                    }
                ]
            });
        } else {
            const { total } = await memberService.getTotalGuildCoins(robberKey);
            const penalty = Math.floor(total * 0.02);

            await memberService.removeGuildCoinsWithVault(robberKey, penalty);

            return interaction.reply({
                files: [
                    {
                        attachment: await createNotifCard({
                            text: penalty === 0
                                ? `[l'interaction a échoué. Aucune pénalité applicable.]`
                                : `[l'interaction a échoué. Une pénalité de ${penalty.toLocaleString('en')} pièces a été appliquée.]`,
                            fontSize: 24,
                            theme: 'red'
                        }),
                        name: 'failureCard.png'
                    }
                ]
            });
        }
    }
})