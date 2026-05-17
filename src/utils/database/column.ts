import { env } from '../env'

export const timestampType = () => {
    return env.DATABASE_TYPE === 'mysql' ? 'timestamp' as const : 'datetime' as const;
}

export const enumType = () => {
    return env.DATABASE_TYPE === 'mysql' ? 'enum' as const : 'simple-enum' as const;
}
