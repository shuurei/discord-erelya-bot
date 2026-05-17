import { DatabaseCacheContext, Event, logger } from '@/core'
import { BaseMessageOptions, ChatInputCommandInteraction, Message, Team } from 'discord.js'
import { GuildService, MemberService, ModuleName, ModuleService, UserService } from '@/database/services'
import { createNotifCard } from '@/components/cards'
import { UserEntityFlags } from '@/utils'

const replyBy = async (interaction: Message | ChatInputCommandInteraction, payload: BaseMessageOptions) => {
    try {
        if (interaction instanceof ChatInputCommandInteraction) {
            return await interaction[interaction.deferred ? 'editReply' : 'reply'](payload);
        } else if (interaction instanceof Message && interaction.channel.isSendable()) {
            return await interaction.reply(payload);
        }
    } catch (ex: any) {
        logger.error(ex);
    }
}

export default new Event({
    name: 'commandCreate',
    async run({ events: [{ command, messageOrInteraction, args }] }) {
        const replyUnauthorization = async (content: string[] | string) => {
            if (!Array.isArray(content)) {
                content = [content];
            }

            return await replyBy(messageOrInteraction, {
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `[${content}]`,
                            fontSize: 24,
                            theme: 'red'
                        }),
                        name: 'UnauthorizedCard.png'
                    }
                ]
            });
        }

        const isSlash = messageOrInteraction instanceof ChatInputCommandInteraction;
        const isMessage = messageOrInteraction instanceof Message;

        try {
            const guild = messageOrInteraction.guild;
            const user = messageOrInteraction instanceof Message
                ? messageOrInteraction.author
                : messageOrInteraction.user;

            // const memberPermissions = messageOrInteraction instanceof Message
            //     ? messageOrInteraction.member?.permissions
            //     : messageOrInteraction.memberPermissions;

            if (!(guild && user)) {
                throw new Error('No guild or no user')
            };

            const guildId = guild.id;
            const userId = user.id;

            const access = command.access ?? null;
            let isDeveloper = false;

            const creator = this.client.application?.owner
            if (creator) {
                if (creator instanceof Team) {
                    isDeveloper = creator.members.has(user.id);
                } else {
                    isDeveloper = creator.id === user.id;
                }
            }

            const [userDatabase, guildDatabase, memberDatabase] = await Promise.all([
                UserService.findOrCreate(userId),
                GuildService.findOrCreate(guildId),
                MemberService.findOrCreate({ guildId, userId }),
            ]);

            const dbc: DatabaseCacheContext = {
                user: userDatabase,
                guild: guildDatabase,
                member: memberDatabase,
            };

            if (access) {
                if (access.guild) {
                    if (access.guild.modules) {
                        const moduleNames = Object.keys(access.guild.modules) as ModuleName[];
                        const modules = await ModuleService.findMany(guild.id, moduleNames);

                        const allEnabled = moduleNames.every(name => modules[name]?.enabled);
                        if (!allEnabled) {
                            return replyUnauthorization(
                                'Un ou plusieurs modules sont désactivés par le gérant du serveur.'
                            );
                        }

                        for (const moduleName of moduleNames) {
                            const moduleConfig = access.guild.modules[moduleName];
                            if (!moduleConfig) continue;

                            const fields = Object.keys(moduleConfig) as (keyof typeof moduleConfig)[];
                            if (fields.length < 1) continue;

                            const module = modules[moduleName];
                            const allFieldsEnabled = fields.every((field) => {
                                const required = moduleConfig[field];
                                const actual = module?.[field as keyof typeof module];

                                return !required || actual === true;
                            });

                            if (!allFieldsEnabled) {
                                return replyUnauthorization(
                                    'Une ou plusieurs options liées à un module requis sont désactivées.'
                                );
                            }
                        }
                    }
                }

                if (access.channel) {
                    if (
                        access.channel?.isNSFW && messageOrInteraction.channel?.isTextBased()
                        && 'nsfw' in messageOrInteraction.channel
                        && !messageOrInteraction.channel.nsfw
                    ) {
                        return await replyUnauthorization(`Contexte invalide. Salon NSFW requis.`);
                    }
                }

                if (access.user) {
                    if (access.user?.isDeveloper && !isDeveloper) {
                        return await replyUnauthorization(`Niveau d'autorisation insuffisante. Niveau 5 requis.`);
                    }

                    if (userDatabase && !isDeveloper) {
                        if (access.user?.isBetaTester && !userDatabase.flagsBitField.has(UserEntityFlags.TESTER)) {
                            return await replyUnauthorization(`Accès restreint. Privilége bêta requis.`);
                        }
                    }

                    if (access.user.isGuildOwner && user.id !== guild.ownerId) {
                        return await replyUnauthorization(`Vous n’êtes pas le propriétaire de cette serveur`);
                    }

                    // if (access.user?.requiredPermissions && !memberPermissions?.has(access.user.requiredPermissions)) {
                    //     return await replyAuthorizationRefused(`Permissions insuffisantes.`);
                    // }
                }
            }

            if (isSlash && command.onInteraction && messageOrInteraction.inCachedGuild()) {
                return await command.onInteraction(messageOrInteraction, { dbc });
            } else if (isMessage && command.onMessage && messageOrInteraction.inGuild()) {
                return await command.onMessage(messageOrInteraction, { args: args ?? [], dbc });
            }
        } catch (err: any) {
            this.client.logger.error(err);

            // if (this.client.hub && this.client.hub?.heartLogsChannel) {
            //     await this.client.hub.heartLogsChannel.send({
            //         embeds: [
            //             EmbedUI.create({
            //                 color: 'blue',
            //                 title: `🌐 Command Error`,
            //                 description: [
            //                     `- Command Type: \`${isSlash ? 'Slash' : isMessage ? 'Message' : 'Unknown'}\``,
            //                     `- Guild`,
            //                     `  - \`${interaction.guild?.name}\``,
            //                     `  - \`${interaction.guild?.id}\``,
            //                     `- Author`,
            //                     `  - \`${interaction.member?.user?.username}\``,
            //                     `  - \`${interaction.member?.user?.id}\``,
            //                 ].join(`\n`)
            //             }),
            //             EmbedUI.create({
            //                 color: 'red',
            //                 title: '🐞 Stack',
            //                 description: `>>> ${err?.stack}`
            //             })
            //         ],
            //     });
            // }

            return await replyBy(messageOrInteraction, {
                files: [
                    {
                        attachment: await createNotifCard({
                            text: '[Une anomalie a été détectée.]',
                            theme: 'red'
                        }),
                        name: 'ErrorCard.png'
                    }
                ]
            });
        }
    }
});