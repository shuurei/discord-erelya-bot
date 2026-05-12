import { EmbedBuilder, EmbedData } from 'discord.js'
import { applicationEmojiHelperSync } from '@/utils'
import { ApplicationEmojiName, COLORS, Color } from '@/config'

import { logger } from './Logger'

export type FastEmbedData = Omit<EmbedData, 'color'> & {
    color?: Color | number
};

export type FastEmbedDataWithoutColor = Omit<FastEmbedData, 'color'>;
export type FastEmbedDataWithoutDescription = Omit<FastEmbedData, 'description'>;
export type FastEmbedDataWithoutColorAndDescription = Omit<FastEmbedData, 'color' | 'description'>;

export class FastEmbed {
    private static normalize(content: string | FastEmbedData, options?: FastEmbedDataWithoutDescription) {
        return typeof content === 'object'
            ? { ...content, ...options }
            : { ...options, description: content };
    }

    static create(data: FastEmbedData) {
        if (data.color && typeof data.color !== 'number') {
            const resolvedColor = COLORS[data.color];

            if (!resolvedColor) {
                logger.warn(`Embed color "${data.color}" is undefined`);

                data.color = 0x000000;
            } else {
                data.color = resolvedColor;
            }
        }

        return new EmbedBuilder(data as EmbedData).toJSON();
    }

    static createMessage(content: string | FastEmbedData, options?: FastEmbedDataWithoutDescription) {
        return this.create(this.normalize(content, options));
    }

    private static createTypedMessage(
        emojiName: ApplicationEmojiName,
        color: Color | number,
        content: string | FastEmbedDataWithoutColor,
        options?: FastEmbedDataWithoutColor
    ) {
        const normalized = this.normalize(content, options);
        const emoji = applicationEmojiHelperSync()[`${emojiName}Emoji`] ?? '❓';

        return this.create({
            ...normalized,
            description: `${emoji} ${normalized.description ?? ''}`,
            color
        });
    }

    static createInfoMessage(content: string | FastEmbedDataWithoutColor, options?: FastEmbedDataWithoutColorAndDescription) {
        return this.createTypedMessage('blueBullet', COLORS.blue, content, options);
    }

    static createSuccessMessage(content: string | FastEmbedDataWithoutColor, options?: FastEmbedDataWithoutColorAndDescription) {
        return this.createTypedMessage('greenBullet', COLORS.green, content, options);
    }

    static createWarnMessage(content: string | FastEmbedDataWithoutColor, options?: FastEmbedDataWithoutColorAndDescription ) {
        return this.createTypedMessage('yellowBullet', COLORS.yellow, content, options);
    }

    static createErrorMessage(content: string | FastEmbedDataWithoutColor, options?: FastEmbedDataWithoutColorAndDescription) {
        return this.createTypedMessage('redBullet', COLORS.red, content, options);
    }
}

export default FastEmbed;