import { DataSource, DataSourceOptions } from 'typeorm'

import { BetterSqlite3ConnectionOptions } from 'typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions.js'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions.js'

import { env } from '@/utils'
import path from 'path'

const base: Partial<DataSourceOptions> = {
    synchronize: env.isDev,
    entities: [ path.join(import.meta.dirname, 'entities/**/*.{ts,js}') ],
    migrations: [ path.join(import.meta.dirname, 'migrations/**/*.{ts,js}') ],
};

const MySQLConfigOptions: MysqlConnectionOptions = {
    type: 'mysql',
    host: env.DATABASE_HOST,
    database: env.DATABASE_NAME,
    port: env.DATABASE_PORT,
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD
}

const MySQLiteConfigOptions: BetterSqlite3ConnectionOptions = {
    type: 'better-sqlite3',
    database: path.join(import.meta.dirname, env.DATABASE_NAME ?? 'erelya_dev.db'),
}

console.log(env.DATABASE_TYPE, base, MySQLConfigOptions)

export const db = new DataSource({
    ...base,
    ...env.DATABASE_TYPE === 'mysql' ? MySQLConfigOptions : MySQLiteConfigOptions
} as DataSourceOptions);

export default db;