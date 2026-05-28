import { ApplicationEmoji, Collection, GuildEmoji } from 'discord.js'
import { ApplicationEmojiName, currentApplicationEmojiIds } from '@/config'
import client from '@/client'

export type Emoji = {
    [Key in ApplicationEmojiName as `${Key & string}Emoji`]: GuildEmoji | ApplicationEmoji;
};

export const applicationEmojiHelperSync = () => {
    const emojisCached = new Collection<string, GuildEmoji | ApplicationEmoji>([
        ...client.emojis.cache.entries(),
        ...client.application?.emojis.cache.entries() ?? [],
    ]);

    return Object.entries(currentApplicationEmojiIds).reduce((acc, [emojiName, emojiId]) => {
        const emoji = emojisCached.get(emojiId);
        if (emoji) {
            Object.assign(acc, {
                [`${emojiName}Emoji`]: emoji ?? '❓'
            });
        }

        return acc;
    }, {} as Partial<Emoji>);
}

export const applicationEmojiHelper = async () => {
    if (client.application) {
        await client.application.emojis.fetch();
    }

    return applicationEmojiHelperSync();
}