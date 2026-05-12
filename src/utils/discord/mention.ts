import { MessageMentions } from 'discord.js'

export const parseMention = (type: RegExp, mention: string | null) => {
    if (mention) {
        return mention.match(type)?.[1] ?? null;
    }
}

export const parseUserMention = (mention: string | null) => {
    return parseMention(MessageMentions.UsersPattern, mention);
}

export const parseRoleMention = (mention: string | null) => {
    return parseMention(MessageMentions.RolesPattern, mention);
}

export const parseChannelMention = (mention: string | null) => {
    return parseMention(MessageMentions.ChannelsPattern, mention);
}

export const parseEveryoneMention = (mention: string | null) => {
    return parseMention(MessageMentions.EveryonePattern, mention);
}