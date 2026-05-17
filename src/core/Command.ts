import {
    RESTPostAPIApplicationCommandsJSONBody,
    APIApplicationCommandBasicOption,
    ChatInputCommandInteraction,
    InteractionContextType,
    PermissionResolvable,
    PermissionsBitField,
    LocalizationMap,
    Message,
    ButtonInteraction,
} from 'discord.js'

import {
    User as UserEntity,
    Guild as GuildEntity,
    Member as MemberEntity
} from '@/database/entities'

import { CustomClient } from './CustomClient'
import client from '@/client'
import { BooleanKeys, ModuleEntity, ModuleName } from '@/database/services'

/** @deprecated */
export enum CommandMessageStyle {
    FLAT = 'flat',
    SLASH_COMMAND = 'slashCommand',
}

export interface MessageCommandOptions {
    name?: string;
    nameLocalizations?: LocalizationMap;
    style?: CommandMessageStyle | `${CommandMessageStyle}`;
    aliases?: string[];
}

export interface SlashCommandContextOptions {
    guild?: boolean
    botDM?: boolean
    group?: boolean
}

export interface SlashCommandOptions {
    name?: string;
    nameLocalizations?: LocalizationMap;
    context?: SlashCommandContextOptions;
    arguments?: APIApplicationCommandBasicOption[];
}

export interface CommandAccessOptions {
    user?: {
        authorizedIds?: string[];
        isDeveloper?: boolean;
        isBetaTester?: boolean;
        isGuildOwner?: boolean;
        isStaff?: boolean;
        requiredPermissions?: (PermissionResolvable | bigint)[];
    },
    channel?: {
        authorizedIds?: string[];
        isNSFW?: boolean;
    },
    guild?: {
        authorizedIds?: string[];
        isPremium?: boolean;
        isPartner?: boolean;
        modules?: Partial<{
            [K in ModuleName]: Partial<{
                [P in BooleanKeys<ModuleEntity<K>>]: boolean
            }>
        }>
    };
}

export interface CommandMessageContext {
    args: (any | null)[];
}

export interface CommandStructure {
    interaction?: {
        commandName: string | null;
        subcommandName?: string | null;
        subcommandGroupName?: string | null;
    };
    message?: {
        commandName: string | null;
        parts?: string[];
    };
}

export interface DatabaseCacheContext {
    user: UserEntity;
    guild: GuildEntity;
    member: MemberEntity;
}

export interface CommandInteractionContext {
    dbc: DatabaseCacheContext;
}

export interface CommandMessageContext {
    args: (any | null)[];
    dbc: DatabaseCacheContext;
}

export interface CommandOptions {
    nameLocalizations?: LocalizationMap;
    description?: string;
    descriptionLocalizations?: LocalizationMap;
    access?: CommandAccessOptions;
    cooldown?: number;
    slashCommand?: SlashCommandOptions;
    messageCommand?: MessageCommandOptions;
    onInteraction?: (this: Command, interaction: ChatInputCommandInteraction<'cached'>, ctx: CommandInteractionContext) => any;
    onButton?: (this: Command, interaction: CommandButtonInteraction) => any;
    onMessage?: (this: Command, message: Message<true>, ctx: CommandMessageContext) => any;
}

export interface CommandButtonInteraction extends ButtonInteraction<'cached'> {
    invokerId: string;
    originalCustomId: string;
}

export class Command {
    client: CustomClient;

    id: string;

    nameLocalizations?: LocalizationMap;
    description?: string;
    descriptionLocalizations?: LocalizationMap;
    access?: CommandAccessOptions;

    messageCommand: MessageCommandOptions;
    slashCommand?: SlashCommandOptions;

    structure: CommandStructure;

    onInteraction?: (interaction: ChatInputCommandInteraction<'cached'>, ctx: CommandInteractionContext) => any;
    onButton?: (interaction: CommandButtonInteraction) => any;
    onMessage?: (message: Message, ctx?: CommandMessageContext) => any;

    constructor(options: CommandOptions) {
        if (!(options.onInteraction || options.onMessage)) {
            throw new Error('A command must implement at least one handler: "onInteraction" for slash commands or "onMessage" for prefix commands !');
        }

        this.client = client;
        this.structure = {};
        this.messageCommand = {
            style: CommandMessageStyle.SLASH_COMMAND,
            ...options?.messageCommand ?? {},
        };

        Object.assign(this, options);
    }

    get name() {
        const { message, interaction } = this.structure;
        return interaction?.subcommandName ?? interaction?.commandName ?? this.messageCommand?.name ?? message?.commandName ?? 'unknown';
    }

    toAPI() {
        const data: RESTPostAPIApplicationCommandsJSONBody = {
            name: this.name,
            description: this.description ?? this.name,
            name_localizations: this.nameLocalizations,
            description_localizations: this.descriptionLocalizations,
            nsfw: this.access?.channel?.isNSFW ?? false,
            options: this.slashCommand?.arguments
        }

        if (this.slashCommand?.context) {
            const { botDM, group, guild } = this.slashCommand.context;

            let contexts = [];

            if (guild) {
                contexts.push(InteractionContextType.Guild);
            }

            if (botDM) {
                contexts.push(InteractionContextType.BotDM);
            }

            if (group) {
                contexts.push(InteractionContextType.PrivateChannel);
            }

            data.contexts = contexts;
        }

        if (this.access?.user?.requiredPermissions) {
            data.default_member_permissions = this.access.user.requiredPermissions.reduce((
                acc: bigint,
                perm: PermissionResolvable
            ) => {
                return acc | PermissionsBitField.resolve(perm);
            }, 0n).toString();
        }

        return data;
    }
}