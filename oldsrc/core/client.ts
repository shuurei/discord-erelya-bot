import {
    DefaultWebSocketManagerOptions,
    Client as DiscordClient,
    DiscordjsErrorCodes,
    ActivityType,
    ChannelType,
    ClientOptions,
    ForumChannel,
    TextChannel,
    Guild
} from 'discord.js'

import { CallSessionManager, CommandManager, EventManager } from '@/client/managers'

import { Logger } from './logger'
import { ClientEvents } from './event'

import { logger, randomNumber } from '@/utils'
import pkg from '@pkg'

export class Client extends DiscordClient {
    hub?: Guild & {
        ticketChannel?: ForumChannel;
        heartLogsChannel?: TextChannel;
    };

    isDatabaseConnected: boolean;

    events: EventManager;
    commands: CommandManager;
    callSessions: CallSessionManager;

    logger: Logger;
    reflexions: string[];

    on<Event extends keyof ClientEvents>(
        event: Event,
        listener: (...args: ClientEvents[Event]) => void
    ) {
        return super.on(event as string, listener);
    };

    once<Event extends keyof ClientEvents>(
        event: Event,
        listener: (...args: ClientEvents[Event]) => void
    ) {
        return super.once(event as string, listener);
    };

    emit<Event extends keyof ClientEvents>(
        event: Event,
        ...args: ClientEvents[Event]
    ) {
        return super.emit(event as string, ...args);
    };

    off<Event extends keyof ClientEvents>(
        event: Event,
        listener: (...args: ClientEvents[Event]) => void
    ) {
        return super.off(event as string, listener);
    };

    removeAllListeners<Event extends keyof ClientEvents>(event?: Event) {
        return super.removeAllListeners(event as string);
    };

    constructor(options: ClientOptions) {
        super({
            ...options,
            ws: {
                buildStrategy(manager) {
                    manager.options.identifyProperties.browser = 'Discord Android';
                    return DefaultWebSocketManagerOptions?.buildStrategy(manager);
                }
            },
        });

        this.isDatabaseConnected = false;

        this.events = new EventManager(this);
        this.commands = new CommandManager(this);
        this.callSessions = new CallSessionManager(this);

        this.logger = logger.use({
            prefix: (c) => c.white(`[CLIENT] <🤖>`)
        });

        this.reflexions = [
            `v${pkg.version}`,
            "Chargement du module sarcasme..",
            "Bonjour le monde !",
            "Bonjour le monde, encore",
            "Bonjour le monde, encore... et encore",
            "Déboguer la vie, une ligne à la fois",
            "Envoi de high-fives virtuels",
            "Dans le vide, j'observe",
            "Échos du code",
            "existential.exe en cours d'exécution",
            "J'❤ Radiohead",
            "Prédiction du chaos.. Plutôt juste ?",
            "Puis-je.. Puis-je aimer ?",
            "Vie sociale - 404 introuvable",
            "Fonctionne à vide.. En quelque sorte ?",
        ] as const;
    }

    randomReflexion() {
        if (this.user) {
            const reflexion = this.reflexions[Math.floor(Math.random() * this.reflexions.length)];
            this.user.setActivity(reflexion, { type: ActivityType.Custom });
            return reflexion;
        }
    }

    async login(token?: string) {
        logger.info(`The client is trying to connect to Discord..`, { arrowColor: 'orangeBright' });

        token ??= process.env.CLIENT_TOKEN;

        if (!token) {
            throw new Error(DiscordjsErrorCodes.TokenMissing);
        }

        if (typeof token !== 'string') {
            throw new Error(DiscordjsErrorCodes.TokenInvalid);
        }

        this.token = token;
        this.rest.setToken(token);

        return await super.login(this.token).then(async (token) => {
            const user = this.user;
            if (user) {
                this.logger = logger.use({
                    prefix: ({ purple, purpleBright }) => {
                        return purple('[').concat(purpleBright(user.username)).concat(purple(']'));
                    }
                });

                await this.commands.syncSlashCommands();

                if (process.env.HUB_GUILD_ID) {
                    this.logger.info('Initializing client hub', { arrowColor: 'orangeBright' });

                    const hub = await this.guilds.fetch(process.env.HUB_GUILD_ID);
                    if (!hub) {
                        throw new Error(`❌ » Hub guild not found (${process.env.HUB_GUILD_ID})`);
                    }

                    if (process.env.HUB_TICKET_CHANNEL_ID) {
                        const ticketChannel = await hub.channels.fetch(process.env.HUB_TICKET_CHANNEL_ID);
                        if (ticketChannel?.type === ChannelType.GuildForum) {
                            this.hub = Object.assign(hub, {
                                ticketChannel
                            });

                            this.logger.info('Hub ticket channel initialized', { arrowColor: 'greenBright' });
                        } else {
                            throw new Error(`❌ » Hub ticket channel invalid (${process.env.HUB_TICKET_CHANNEL_ID})`);
                        }
                    } else {
                        this.logger.info(`Hub Ticket Channel skipped`, { arrowColor: 'orangeBright' });
                    }

                    if (process.env.HUB_HEART_LOGS_CHANNEL_ID) {
                        const heartLogsChannel = await hub.channels.fetch(process.env.HUB_HEART_LOGS_CHANNEL_ID);
                        if (heartLogsChannel?.type === ChannelType.GuildText) {
                            this.hub = Object.assign(hub, { heartLogsChannel });

                            this.logger.info('Hub heart logs initialized', { arrowColor: 'greenBright' });
                        } else {
                            throw new Error(`❌ » Hub heart logs channel invalid (${process.env.HUB_HEART_LOGS_CHANNEL_ID})`);
                        }
                    } else {
                        this.logger.info(`Hub Heart Logs skipped`, { arrowColor: 'orangeBright' });
                    }

                    this.emit('hubReady', hub);
                    this.logger.info('Hub initialized', { arrowColor: 'greenBright' });
                } else {
                    this.logger.info('Skipped hub initialization', { arrowColor: 'orangeBright' });
                }

                if (this.application) {
                    await this.application.fetch();
                    await this.application.emojis.fetch();
                }

                this.randomReflexion();
                setInterval(() => this.randomReflexion(), randomNumber(1, 10) * 60 * 1000);
            }

            this.emit('clientSetup', this);

            return token;
        });
    }

    async start(token?: string) {
        logger.header(({ purpleBright }) => purpleBright('✦ CLIENT ✦'));

        await this.events.listen({ directory: 'events' });
        await this.commands.load({ directory: 'commands' });

        return await this.login(token);
    }
}