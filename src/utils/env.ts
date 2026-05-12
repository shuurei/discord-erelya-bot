const STAGE = process.env.STAGE ?? 'DEV';

export const env = {
    ...process.env,
    STAGE,
    isDev: STAGE === 'DEV',
    isProd: STAGE === 'PROD'
}