import {
    Guild,
    Client,
    ChannelType,
    TextChannel,
    ActivityType,
    ClientOptions,
    ForumChannel,
    DiscordjsErrorCodes,
    DefaultWebSocketManagerOptions,
} from 'discord.js'

import { logger, Logger } from './Logger'
import { randomBetween } from '@/utils'
import { CustomClientEvents } from './Event'

import {
    JobManager,
    EventManager,
    CommandManager,
    VoiceSessionManager,
    DatabaseManager
} from './managers'

export interface CustomClientHub extends Guild {
    ticketChannel?: ForumChannel;
    heartLogsChannel?: TextChannel;
}

export interface CustomClientOptions extends Partial<ClientOptions> {
    reflexions?: string[];
}

export class CustomClient extends Client {
    hub?: CustomClientHub;

    jobs: JobManager;
    events: EventManager;
    commands: CommandManager;
    database: DatabaseManager;
    voiceSessions: VoiceSessionManager;

    logger: Logger;
    reflexions?: string[];

    on<Event extends keyof CustomClientEvents>(
        event: Event,
        listener: (...args: CustomClientEvents[Event]) => void
    ) {
        return super.on(event as string, listener);
    };

    once<Event extends keyof CustomClientEvents>(
        event: Event,
        listener: (...args: CustomClientEvents[Event]) => void
    ) {
        return super.once(event as string, listener);
    };

    emit<Event extends keyof CustomClientEvents>(
        event: Event,
        ...args: CustomClientEvents[Event]
    ) {
        return super.emit(event as string, ...args);
    };

    off<Event extends keyof CustomClientEvents>(
        event: Event,
        listener: (...args: CustomClientEvents[Event]) => void
    ) {
        return super.off(event as string, listener);
    };

    removeAllListeners<Event extends keyof CustomClientEvents>(event?: Event) {
        return super.removeAllListeners(event as string);
    };

    constructor(options: CustomClientOptions) {
        super({
            ...options as any,
            ws: {
                buildStrategy(manager) {
                    manager.options.identifyProperties.browser = 'Discord Android';
                    return DefaultWebSocketManagerOptions?.buildStrategy(manager);
                }
            },
        });

        this.jobs = new JobManager(this);
        this.events = new EventManager(this);
        this.commands = new CommandManager(this);
        this.database = new DatabaseManager(this);
        this.voiceSessions = new VoiceSessionManager(this);

        this.logger = logger.use({
            prefix: (c) => c.white(`[CLIENT] <🤖>`)
        });

        this.reflexions = options.reflexions;
    }

    setRandomReflexion() {
        if (!this.user || !this.reflexions) return

        const reflexion = this.reflexions[Math.floor(Math.random() * this.reflexions.length)];
        this.user.setActivity(reflexion, { type: ActivityType.Custom });
    }

    async initializeHub() {
        if (!process.env.HUB_GUILD_ID) {
            return this.logger.info('Skipped hub initialization', { arrowColor: 'orangeBright' });
        };

        this.logger.info('Initializing client hub..', { arrowColor: 'orangeBright' });

        const hub = await this.guilds.fetch(process.env.HUB_GUILD_ID);
        if (!hub) {
            throw new Error(`❌ » Guild Hub not found (${process.env.HUB_GUILD_ID})`);
        }

        this.hub = hub;

        if (process.env.HUB_HEART_LOGS_CHANNEL_ID) {
            const heartLogsChannel = await hub.channels.fetch(process.env.HUB_HEART_LOGS_CHANNEL_ID);
            if (heartLogsChannel?.type === ChannelType.GuildText) {
                this.hub = Object.assign(hub, { heartLogsChannel });
                this.logger.info('Hub heart logs initialized', { arrowColor: 'greenBright' });
            } else {
                throw new Error(`❌ » Guild Hub heart logs channel invalid (${process.env.HUB_HEART_LOGS_CHANNEL_ID})`);
            }
        } else {
            this.logger.info(`Hub Heart Logs skipped`, { arrowColor: 'orangeBright' });
        }

        this.emit('hubReady', hub);
        this.logger.info('Hub initialized', { arrowColor: 'greenBright' });
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
            const client = this.user;
            if (client) {
                this.logger = logger.use({
                    prefix: ({ purple, purpleBright }) => {
                        return purple('[').concat(purpleBright(client.username)).concat(purple(']'));
                    }
                });

                if (this.application) {
                    await this.application.fetch();
                    await this.application.emojis.fetch();
                }

                if (this.reflexions) {
                    this.setRandomReflexion();
                    setInterval(() => this.setRandomReflexion(), randomBetween(3, 8) * 60 * 1000);
                }

                await this.commands.syncSlashCommands();

                logger.info(({ greenBright }) => `${greenBright(client.username)} successfully connected !`, { arrowColor: 'greenBright' });
            }

            return token;
        });
    }

    async start(token?: string) {
        logger.header(({ purpleBright }) => purpleBright('✦ CLIENT ✦'));

        await this.events.listen({ directoryPath: 'events' });
        await this.commands.load({ directoryPath: 'commands' });

        return await this.login(token).then(async () => {
            await this.initializeHub();
            await this.database.initialize();
            await this.jobs.initialize({ directoryPath: 'jobs' });
        });
    }
}

export default Client;