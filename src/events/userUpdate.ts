import { Event } from '@/core'
import { Events } from 'discord.js'
import { GuildService, UserService } from '@/database/services'

export default new Event({
    name: Events.UserUpdate,
    async run({ events: [oldUser, newUser] }) {
        const oldGuildId = oldUser.primaryGuild?.identityGuildId;
        const newGuildId = newUser.primaryGuild?.identityGuildId;

        if (oldGuildId === newGuildId) return;

        const guildIds = [oldGuildId, newGuildId].filter(Boolean) as string[];

        await Promise.all(guildIds.map(async (guildId) => {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) return;

            const member = guild.members.cache.get(newUser.id);
            if (!member) return;

            const hasTag = member.user.primaryGuild?.identityGuildId === guildId;
            if (hasTag) {
                await UserService.setTagAssignedAt(member.id);
            } else {
                await UserService.resetTagAssignedAt(member.id);
            }

            const { supportRoleId } = await GuildService.findById(guildId) ?? {};
            if (!supportRoleId) return;

            const hasRole = member.roles.cache.has(supportRoleId);
            if (hasTag === hasRole) return;

            if (hasTag) {
                await member.roles.add(supportRoleId);
            } else {
                await member.roles.remove(supportRoleId);
            }
        }));
    }
});