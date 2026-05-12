import { APIContainerComponent, ContainerBuilder } from 'discord.js'
import { ApplicationEmojiName, Color, COLORS } from '@/config'
import { applicationEmojiHelperSync } from '@/utils'

import FastComponent from './FastComponent'
import { logger } from './Logger';

export type FastContainerData = Omit<APIContainerComponent, 'id' | 'type' | 'accent_color'> & {
    color?: Color | number
};

export type FastContainerMessageOptions = Partial<FastContainerData> & {
    title?: string;
    description?: string;
}

export type FastContainerMessageOptionsWithoutColor = Omit<FastContainerMessageOptions, 'accent_color'>
export type FastContainerMessageOptionsWithoutDescription = Omit<FastContainerMessageOptions, 'message'>;
export type FastContainerMessageOptionsWithoutColorAndDescription = Omit<FastContainerMessageOptions, 'message' | 'accent_color'>

export class FastContainer {
    private static normalize(content: string | FastContainerMessageOptions, options?: FastContainerMessageOptionsWithoutDescription) {
        return typeof content === 'string'
            ? { ...options, description: content }
            : { ...content, ...options };
    }

    static create(data: FastContainerData) {
        if (data.color && typeof data.color !== 'number') {
            const resolvedColor = COLORS[data.color];

            if (!resolvedColor) {
                logger.warn(`Container color "${data.color}" is undefined`);
            } else {
                data.color = resolvedColor;
            }
        }

        return new ContainerBuilder({
            ...data,
            accent_color: data.color as number | undefined
        }).toJSON();
    }

    static createMessage(content: string | FastContainerMessageOptions , options?: FastContainerMessageOptionsWithoutDescription) {
        const data = this.normalize(content, options);

        data.components ??= [];

        if (data.description) {
            data.components.unshift(FastComponent.createTextDisplay(data.description));
        }

        if (data.title) {
            data.components.unshift(FastComponent.createTextDisplay(`### ${data.title}`));
        }

        return this.create({ ...data, components: data.components });
    }

    private static createTypedMessage(
        emojiName: ApplicationEmojiName,
        color: Color | number,
        content: string | FastContainerMessageOptionsWithoutColor,
        options?: FastContainerMessageOptionsWithoutColorAndDescription
    ) {
        const normalized = this.normalize(content, options);
        const emoji = applicationEmojiHelperSync()[`${emojiName}Emoji`] ?? '❓';
        
        return this.createMessage({
            ...normalized,
            description: `${emoji} ${normalized.description}`,
            color
        });
    }

    static createInfoMessage(content: string | FastContainerMessageOptionsWithoutColor, options?: FastContainerMessageOptionsWithoutColorAndDescription) {
        return this.createTypedMessage('blueBullet', COLORS.blue, content, options);
    }

    static createSuccessMessage(content: string | FastContainerMessageOptionsWithoutColor, options?: FastContainerMessageOptionsWithoutColorAndDescription) {
        return this.createTypedMessage('greenBullet', COLORS.green, content, options);
    }

    static createWarnMessage(content: string | FastContainerMessageOptionsWithoutColor, options?: FastContainerMessageOptionsWithoutColorAndDescription) {
        return this.createTypedMessage('yellowBullet', COLORS.yellow, content, options);
    }

    static createErrorMessage(content: string | FastContainerMessageOptionsWithoutColor, options?: FastContainerMessageOptionsWithoutColorAndDescription) {
        return this.createTypedMessage('redBullet', COLORS.red, content, options);
    }
}

export default FastContainer;