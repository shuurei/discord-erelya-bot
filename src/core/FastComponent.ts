import { applicationEmojiHelperSync } from '@/utils';
import {
    ButtonStyle,
    SeparatorSpacingSize,
    ComponentEmojiResolvable,
    // API
    APIButtonComponent,
    APISectionComponent,
    APIUnfurledMediaItem,
    APIActionRowComponent,
    APIThumbnailComponent,
    APIComponentInMessageActionRow,
    // Builders
    ButtonBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    ActionRowBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    UserSelectMenuBuilder,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    // Data
    ButtonComponentData,
    MediaGalleryItemData,
    LinkButtonComponentData,
    UserSelectMenuComponentData,
    RoleSelectMenuComponentData,
    StringSelectMenuComponentData,
    ChannelSelectMenuComponentData,
    InteractionButtonComponentData,
} from 'discord.js'
import { Command } from './Command';

// Separator
export interface FastComponentSeparatorOptions {
    isSpaced?: boolean;
    divider?: boolean;
}

// Button
export enum FastComponentButtonColor {
    Blue = ButtonStyle.Primary,
    Gray = ButtonStyle.Secondary,
    Green = ButtonStyle.Success,
    Red = ButtonStyle.Danger,
}

export interface FastComponentInteractionButtonCustomId {
    id: string;
    invokerId: string;
    commandId: string;
}

export type FastComponentLinkButtonOptions = Omit<LinkButtonComponentData, 'type' | 'label' | 'style'>;
export type FastComponentInteractionButtonOptions = Omit<InteractionButtonComponentData, 'type' | 'label' | 'style' | 'customId'> & {
    color?: keyof typeof FastComponentButtonColor | FastComponentButtonColor | Omit<ButtonStyle, 'Link' | 'Premium'>;
    customId: string | FastComponentInteractionButtonCustomId | false
};

// Section
export type FastComponentSectionOptions = Omit<APISectionComponent, 'id' | 'type'>

// Thumbnail
export type FastComponentThumbnailOptions = Omit<APIThumbnailComponent, 'type' | 'id' | 'media'>

// Select Menu
export type FastComponentStringSelectMenuOptions = Omit<StringSelectMenuComponentData, 'type' | 'id'>
export type FastComponentRoleSelectMenuOptions = Omit<RoleSelectMenuComponentData, 'type' | 'id'>
export type FastComponentChannelSelectMenuOptions = Omit<ChannelSelectMenuComponentData, 'type' | 'id'>
export type FastComponentUserSelectMenuOptions = Omit<UserSelectMenuComponentData, 'type' | 'id'>

export class FastComponent {
    static createActionRow = <ComponentType extends APIComponentInMessageActionRow>(components: ComponentType[]) => {
        return new ActionRowBuilder({ components }).toJSON() as APIActionRowComponent<ComponentType>;
    }

    static createTextDisplay = (content: string) => {
        return new TextDisplayBuilder({ content }).toJSON();
    }

    static createSeparator = (options?: FastComponentSeparatorOptions) => {
        return new SeparatorBuilder({
            spacing: options?.isSpaced
                ? SeparatorSpacingSize.Large
                : SeparatorSpacingSize.Small,
            divider: options?.divider ?? true
        }).toJSON();
    }

    static createButton(label: string | ComponentEmojiResolvable, options: FastComponentLinkButtonOptions): APIButtonComponent;
    static createButton(label: string | ComponentEmojiResolvable, options: FastComponentInteractionButtonOptions): APIButtonComponent;
    static createButton(label: string | ComponentEmojiResolvable | null, options: FastComponentInteractionButtonOptions | FastComponentLinkButtonOptions) {
        let style;

        if ('url' in options) {
            style = ButtonStyle.Link;
        } else if (options.color) {
            if (typeof options.color === 'string') {
                style = FastComponentButtonColor[options.color] ?? ButtonStyle.Primary;
            } else {
                style = options.color;
            }
        } else {
            style = ButtonStyle.Primary;
        }

        if (label && typeof label !== 'string') {
            options.emoji = label;
            label = null;
        }

        if ('customId' in options) {
            if (typeof options.customId === 'object') {
                const { id, invokerId, commandId } = options.customId;
    
                options.customId = `${commandId}#${invokerId}#${id}`;
            } else if (typeof options.customId === 'boolean') {
                options.customId = (Math.floor(Math.random() * Date.now())).toString();
            }
        }

        return new ButtonBuilder({
            ...options,
            label,
            style
        } as ButtonComponentData).toJSON();
    }

    static createSection = (options: FastComponentSectionOptions) => {
        return new SectionBuilder(options).toJSON();
    }

    static createThumbnail = (media: APIUnfurledMediaItem, options?: FastComponentThumbnailOptions) => {
        return new ThumbnailBuilder({ ...options, media: media }).toJSON();
    }

    static createMediaGallery = (items: MediaGalleryItemData[]) => {
        return new MediaGalleryBuilder({ items }).toJSON();
    }

    static createStringSelectMenu = (options: FastComponentStringSelectMenuOptions) => {
        return new StringSelectMenuBuilder(options).toJSON();
    }

    static createRoleSelectMenu = (options: FastComponentRoleSelectMenuOptions) => {
        return new RoleSelectMenuBuilder(options).toJSON();
    }

    static createChannelSelectMenu = (options: FastComponentChannelSelectMenuOptions) => {
        return new ChannelSelectMenuBuilder(options).toJSON();
    }

    static createUserSelectMenu = (options: FastComponentUserSelectMenuOptions) => {
        return new UserSelectMenuBuilder(options).toJSON();
    }
}

export default FastComponent;