import { NodeEnv } from './nodeEnv'

export type StageType = 'DEV' | 'PROD'
export type DatabaseType = 'mysql' | 'better-sqlite3'

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DEFAULT_PREFIX: string;
            STAGE: StageType;
            // CLIENT
            DEBUG?: string;
            TOKEN: string;
            // HUB
            HUB_GUILD_ID?: string;
            HUB_HEART_LOGS_CHANNEL_ID?: string;
            // DISCORD
            CLIENT_ID: string;
            CLIENT_TOKEN?: string;
            // DATABASE
            DATABASE_TYPE: DatabaseType;
            DATABASE_NAME: string;
            DATABASE_HOST: string;
            DATABASE_PORT: number;
            DATABASE_USER: string;
            DATABASE_PASSWORD: string;
        }
    }
}

export {};