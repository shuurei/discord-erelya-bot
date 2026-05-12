import { DeepPartial, FindOptionsWhere } from 'typeorm'

import dataSource from '../data-source'
import { Guild } from '../entities/Guild'

export class GuildService {
    static get repo() {
        return dataSource.getRepository(Guild);
    }

    static async findById(guildId: string, options?: Omit<FindOptionsWhere<Guild>, 'id'>) {
        return await this.repo.findOneBy({
            ...options,
            id: guildId
        });
    }

    static async findOrCreate(guildId: string, options?: Omit<FindOptionsWhere<Guild>, 'id'>) {
        const payload = { ...options, id: guildId }
        let guild = await this.repo.findOneBy(payload);

        if (!guild) {
            guild = this.repo.create(payload as DeepPartial<Guild>);
            await this.repo.save(guild);
        }

        return guild;
    }

    static async updateOrCreate(guildId: string, data?: DeepPartial<Guild>) {
        await this.repo.upsert({
            id: guildId,
            ...data,
        }, ['id']);

        return await this.findById(guildId);
    }

    static async deleteById(guildId: string) {
        return await this.repo.delete({ id: guildId });
    }

    // -- Setter -- //
    static async setWelcomeChannel(guildId: string, channelId: string | null) {
        return await this.updateOrCreate(guildId, { welcomeChannelId: channelId });
    }

    static async setSupportRole(guildId: string, channelId: string | null) {
        return await this.updateOrCreate(guildId, { supportRoleId: channelId });
    }

    static async setMessageDeleteAuditChannel(guildId: string, channelId: string | null) {
        return await this.updateOrCreate(guildId, { messageDeletedAuditChannelId: channelId });
    }

    static async setMessageEditAuditChannel(guildId: string, channelId: string | null) {
        return await this.updateOrCreate(guildId, { messageEditedAuditChannelId: channelId });
    }

    static async setLastEventAt(guildId: string, date: Date | null) {
        return await this.updateOrCreate(guildId, { lastEventAt: date ?? new Date() });
    }
}