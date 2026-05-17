import { DataSource } from 'typeorm'

import { CustomClient } from '../CustomClient'
import { logger } from '../Logger'

import db from '@/database/db'

export class DatabaseManager {
    client: CustomClient;
    db: DataSource;

    constructor(client: CustomClient) {
        this.client = client;
        this.db = db;
    }

    async initialize() {
        try {
            logger.info('Connecting to database..', { arrowColor: 'orangeBright' });
            await this.db.initialize();
            logger.info('Database connected successfully !', { arrowColor: 'greenBright' });
        } catch (err: any) {
            logger.error('Database connexion failure :', err);
        }
    }
}

export default DatabaseManager;


                // .then(() => {
                //     console.log("✅ Base de données connectée");
                //     client.login(process.env.DISCORD_TOKEN);
                // })
                // .catch((err) => {
                //     console.error("❌ Erreur de connexion BDD :", err);
                //     process.exit(1);
                // });