import { DeepPartial, FindOptionsWhere } from 'typeorm'

import { Guild } from '../entities/Guild'
import db from '../db'

export class GuildService {
    static get repo() {
        return db.getRepository(Guild);
    }

    // -- CRUD -- //
    static async findById(guildId: string, options?: Omit<FindOptionsWhere<Guild>, 'id'>) {
        return await this.repo.findOneBy({ ...options, id: guildId });
    }

    static async findOrCreate(guildId: string, options?: Omit<FindOptionsWhere<Guild>, 'id'>) {
        const where = { ...options, id: guildId };

        const guild = await this.repo.findOneBy(where);
        if (guild) return guild;

        return await this.repo.save(this.repo.create(where as DeepPartial<Guild>));
    }

    static async updateOrCreate(guildId: string, data?: DeepPartial<Guild>) {
        await this.repo.upsert({ id: guildId, ...data }, ['id']);
        return await this.findById(guildId);
    }

    static async deleteById(guildId: string) {
        return await this.repo.delete({ id: guildId });
    }

    // -- Setters -- //
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

    static async setLastEventAt(guildId: string, date: Date | null = new Date()) {
        return await this.updateOrCreate(guildId, { lastEventAt: date });
    }
}