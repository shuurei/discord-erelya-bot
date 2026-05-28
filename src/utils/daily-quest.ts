export type QuestValue = {
    rewards: {
        guildCoins?: number;
        activityXp?: number;
    };
    value: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
};

export const RARITY_BONUS: Record<QuestValue['rarity'], number> = {
    common: 1,
    uncommon: 1.2,
    rare: 1.3,
    epic: 1.4
};

export const VOICE_POOL: QuestValue[] = [
    // COMMON
    {
        rarity: 'common',
        value: 10,
        rewards: {
            guildCoins: 900,
            activityXp: 350
        }
    },
    {
        rarity: 'common',
        value: 15,
        rewards: {
            guildCoins: 1250,
            activityXp: 500
        }
    },
    {
        rarity: 'common',
        value: 20,
        rewards: {
            guildCoins: 1400,
            activityXp: 550
        }
    },
    {
        rarity: 'common',
        value: 25,
        rewards: {
            guildCoins: 1550,
            activityXp: 600
        }
    },
    {
        rarity: 'common',
        value: 35,
        rewards: {
            guildCoins: 1750,
            activityXp: 700
        }
    },
    // UNCOMMON
    {
        rarity: 'uncommon',
        value: 45,
        rewards: {
            guildCoins: 2200,
            activityXp: 850
        }
    },
    {
        rarity: 'uncommon',
        value: 60,
        rewards: {
            guildCoins: 2600,
            activityXp: 950
        }
    },
    {
        rarity: 'uncommon',
        value: 75,
        rewards: {
            guildCoins: 3000,
            activityXp: 1100
        }
    },
    // RARE
    {
        rarity: 'rare',
        value: 90,
        rewards: {
            guildCoins: 4200,
            activityXp: 1300
        }
    },
    {
        rarity: 'rare',
        value: 120,
        rewards: {
            guildCoins: 5000,
            activityXp: 1600
        }
    },
    {
        rarity: 'rare',
        value: 150,
        rewards: {
            guildCoins: 6500,
            activityXp: 1900
        }
    },
    // EPIC
    {
        rarity: 'epic',
        value: 180,
        rewards: {
            guildCoins: 8000,
            activityXp: 2400
        }
    },
    {
        rarity: 'epic',
        value: 240,
        rewards: {
            guildCoins: 10000,
            activityXp: 3000
        }
    },
    {
        rarity: 'epic',
        value: 360,
        rewards: {
            guildCoins: 14000,
            activityXp: 4000
        }
    }
];

// Reimplated in v2
// export const MESSAGE_POOL: QuestValue[] = [
//     {
//         rarity: 'common',
//         value: 75,
//         rewards: {
//             guildCoins: 750,
//             activityXp: 500
//         }
//     },
//     {
//         rarity: 'uncommon',
//         value: 100,
//         rewards: {
//             guildCoins: 1250,
//             activityXp: 750
//         }
//     },
//     {
//         rarity: 'rare',
//         value: 175,
//         rewards: {
//             guildCoins: 1750,
//             activityXp: 800
//         }
//     },
//     {
//         rarity: 'epic',
//         value: 250,
//         rewards: {
//             guildCoins: 2000,
//             activityXp: 1000
//         }
//     }
// ];

export const getRandomFromPool = (pool: QuestValue[]): QuestValue => {
    const weights: Record<QuestValue['rarity'], number> = {
        common: 40,
        uncommon: 30,
        rare: 20,
        epic: 10
    };

    const totalWeight = pool.reduce((sum, item) => sum + weights[item.rarity], 0);
    let roll = Math.random() * totalWeight;

    for (const item of pool) {
        roll -= weights[item.rarity];
        if (roll <= 0) return item;
    }

    return pool[0];
}

// TODO : Reimplated in v2
// export const generateDailyQuest = () => {
//     const includeVoice = Math.random() < 0.8;
//     const includeMessages = Math.random() < 0.8;

//     if (!includeVoice && !includeMessages) {
//         if (Math.random() < 0.5) {
//             return { voice: null, messages: getRandomFromPool(MESSAGE_POOL) };
//         } else {
//             return { voice: getRandomFromPool(VOICE_POOL), messages: null };
//         }
//     }

//     return {
//         voice: includeVoice ? getRandomFromPool(VOICE_POOL) : null,
//         messages: includeMessages ? getRandomFromPool(MESSAGE_POOL) : null
//     };
// }

export const generateDailyQuest = () => {
    return Math.random() < 0.8 ? getRandomFromPool(VOICE_POOL) : null;
}

export const calculateQuestBonusMultiplier = (quest: { voice?: QuestValue | null, message?: QuestValue | null }) => {
    return quest.voice ? RARITY_BONUS[quest.voice.rarity] : 0;

    // TODO : Reimplated in v2
    // if (quest.voice && quest.message) {
    //     bonus = (RARITY_BONUS[quest.voice.rarity] + RARITY_BONUS[quest.message.rarity]) / 1.6;
    // } else if (quest.voice) {
    //     bonus = RARITY_BONUS[quest.voice.rarity];
    // } else if (quest.message) {
    //     bonus = RARITY_BONUS[quest.message.rarity];
    // }
}