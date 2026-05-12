import { GatewayIntentBits, Partials } from 'discord.js'

import { CustomClient } from './core/CustomClient'
import pkg from '@pkg'

export const client = new CustomClient({
    reflexions: [
        `v${pkg.version}`,
        "Bonjour le monde !",
        "existential.exe en cours d'exécution",
        "J'❤ Radiohead",
        "Neveress To Everness est pas si mal 😋",
        "Prédiction du chaos.. Plutôt juste ?",
        "Puis-je aimer ?",
        "Fonctionne à vide.. En quelque sorte ?",
    ],
    intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Reaction,
        Partials.Message,
        Partials.Channel,
        Partials.User
    ],
});

export default client;