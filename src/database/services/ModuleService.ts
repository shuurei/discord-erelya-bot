import { Repository } from 'typeorm'

import { GuildService } from './GuildService'
import * as Modules from '../entities/modules'
import db from '../db'

export type ModuleName = keyof typeof ModuleService.repos;
export type EntityOf<R> = R extends Repository<infer T> ? T : never;
export type ModuleEntity<K extends ModuleName> = EntityOf<(typeof ModuleService.repos)[K]>;
export type BooleanKeys<T> = { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T];

export class ModuleService {
    static get repos () {
        return {
            event: db.getRepository(Modules.EventModule),
            level: db.getRepository(Modules.LevelModule),
            quest: db.getRepository(Modules.QuestModule),
            economy: db.getRepository(Modules.EconomyModule),
            moderation: db.getRepository(Modules.ModerationModule),
            annoucement: db.getRepository(Modules.AnnouncementModule),
        } as const;
    };

    // -- CRUD -- //
    static async findByName<K extends ModuleName>(guildId: string, moduleName: K) {
        return await this.repos[moduleName].findOneBy({ guildId }) as ModuleEntity<K> | null;
    }

    static async findMany<K extends readonly ModuleName[]>(guildId: string, moduleNames: K) {
        const entries = await Promise.all(
            moduleNames.map(async (name) => [name, await this.findOrCreate(guildId, name)] as const)
        );

        return Object.fromEntries(entries) as { [P in K[number]]: ModuleEntity<P> };
    }

    static async findOrCreate<K extends ModuleName>(guildId: string, moduleName: K) {
        const existing = await this.findByName(guildId, moduleName);
        if (existing) return existing;

        const guild = await GuildService.findOrCreate(guildId);
        const repo = this.repos[moduleName] as Repository<any>;
        const created = repo.create({ guild, guildId });

        return await repo.save(created) as ModuleEntity<K>;
    }

    static async updateOrCreate<K extends ModuleName>(guildId: string, moduleName: K, data: Partial<ModuleEntity<K>>) {
        const repo = this.repos[moduleName] as Repository<any>;
        const module = await this.findByName(guildId, moduleName);

        if (module) {
            repo.merge(module, data);
            return await repo.save(module) as ModuleEntity<K>;
        }

        const guild = await GuildService.findOrCreate(guildId);
        const created = repo.create({ ...data, guild, guildId });

        return await repo.save(created) as ModuleEntity<K>;
    }

    // Utils
    static async toggleField<K extends ModuleName>(guildId: string, moduleName: K, fieldName: BooleanKeys<ModuleEntity<K>>) {
        const module = await this.findOrCreate(guildId, moduleName);
        const payload = { [fieldName]: !module[fieldName] };

        const repo = this.repos[moduleName] as Repository<any>
        await repo.update({ guildId }, payload);

        return { ...module, ...payload } as ModuleEntity<K>;
    }

    static async toggleModule<K extends ModuleName>(guildId: string, moduleName: K) {
        return await this.toggleField(guildId, moduleName, 'enabled');
    }

    static async resetModule<K extends ModuleName>(guildId: string, moduleName: K) {
        const key = `default${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`;
        const defaults = (Modules as Record<string, any>)[key];
        if (!defaults) return await this.findByName(guildId, moduleName);

        const { enabled, ...options } = defaults;
        return await this.updateOrCreate(guildId, moduleName, options);
    }
}