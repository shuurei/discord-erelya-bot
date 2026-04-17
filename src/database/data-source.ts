import { DataSource } from 'typeorm'
import path from 'path'

const {
    ENV,
    DATABASE_NAME,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USERNAME,
    DATABASE_PASSWORD
} = process.env

export const dataSource = new DataSource({
    type: 'mysql',
    host: DATABASE_HOST,
    database: DATABASE_NAME,
    port: DATABASE_PORT,
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    entities: [ path.join(import.meta.dirname, 'entities/*.{ts,js}') ],
    synchronize: ENV === 'DEV',
});

export default dataSource;