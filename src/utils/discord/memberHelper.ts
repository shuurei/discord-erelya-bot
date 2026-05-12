import { GuildMember, ImageURLOptions } from 'discord.js'

import { getDominantColor, GetDominantColorOptions } from '../image'
import { escapeSafe, isOnlySpaces } from '../string'

export interface MemberHelperOptions {
    fetchMember?: boolean;
    fetchUser?: boolean;
    fetchAll?: boolean;
}

export interface MemberHelperGetNameOptions {
    nickname?: boolean;
    globalName?: boolean;
    username?: boolean;
    safe?: boolean;
}

export const MemberHelperSync = (member: GuildMember) => {
    return {
        getName(options?: MemberHelperGetNameOptions) {
            let name = 'unknown';

            const nickname = options?.nickname ?? true
            const globalName = options?.globalName ?? true
            const username = options?.username ?? true

            if (username && member.user.username) {
                name = member.user.username
            }

            if (globalName && member.user.globalName) {
                const safe = escapeSafe(member.user.globalName);

                name = options?.safe
                    ? !isOnlySpaces(safe) && safe.length > 2 ? safe : member.user.username
                    : member.user.globalName
            }

            if (nickname && member.nickname) {
                const safe = escapeSafe(member.nickname);

                name = options?.safe
                    ? !isOnlySpaces(safe) && safe.length > 2 ? safe : member.user.username
                    : member.nickname
            }

            return name;
        },
        async getAvatarDominantColor<Options extends GetDominantColorOptions>(options?: Options) {
            const hex = options?.hex ?? false;

            const avatarURL = this.getAvatarURL({ forceStatic: true });
            if (!avatarURL) {
                return (hex ? 0x000000 : '#000000') as Options['hex'] extends true ? number : string;
            }

            return await getDominantColor(avatarURL, {
                ...options,
                hex,
            }) as Options['hex'] extends true ? number : string;
        },
        getAvatarURL(options?: ImageURLOptions) {
            return member.displayAvatarURL?.(options) ?? member.user.displayAvatarURL?.(options) ?? member.user.defaultAvatarURL;
        },
        getBannerURL(options?: ImageURLOptions) {
            return member.bannerURL(options) ?? member.user.bannerURL(options);
        }
    }
}

export const memberHelper = async (member: GuildMember, options?: MemberHelperOptions) => {
    if (options?.fetchAll || options?.fetchMember) {
        member = await member.fetch();
    }

    if (options?.fetchAll || options?.fetchUser) {
        await member.user.fetch();
    }

    return MemberHelperSync(member);
}