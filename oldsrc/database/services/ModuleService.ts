import { Repository } from 'typeorm'

import dataSource from '../data-source'

import * as Modules from '../entities/modules'
import { GuildService } from './Guild'

export type ModuleName = keyof typeof ModuleService.repo;
type EntityOf<R> = R extends Repository<infer T> ? T : never;
type ModuleEntity<K extends ModuleName> = EntityOf<(typeof ModuleService.repo)[K]>;

type BooleanKeys<T> = {
    [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T];

export class ModuleService {
    static repo = {
        level: dataSource.getRepository(Modules.LevelModule),
        economy: dataSource.getRepository(Modules.EconomyModule)
    } as const;

    static async findByName<K extends ModuleName>(guildId: string, moduleName: K) {
        return await this.repo[moduleName].findOneBy({ guildId }) as ModuleEntity<K> | null
    }

    static async findMany<K extends readonly ModuleName[]>(guildId: string, moduleNames: K) {
        const entries = await Promise.all(
            moduleNames.map(async (moduleName) => {
                const module = await this.findOrCreate(
                    guildId,
                    moduleName
                );

                return [moduleName, module] as const;
            })
        );

        return Object.fromEntries(entries) as {
            [P in K[number]]: ModuleEntity<P>
        };
    }

    static async findOrCreate<K extends ModuleName>(guildId: string, moduleName: K) {
        let module = await this.findByName(guildId, moduleName);

        if (!module) {
            const guild = await GuildService.findOrCreate(guildId);
            const repo = this.repo[moduleName] as any;

            module = repo.create({
                guild,
                guildId
            });

            await repo.save(module);
        }

        return module as ModuleEntity<K>;
    }

    static async updateOrCreate<K extends ModuleName>(
        guildId: string,
        moduleName: K,
        data: Partial<ModuleEntity<K>>
    ) {
        const repo = this.repo[moduleName] as any;

        let module = await this.findByName(guildId, moduleName);

        if (module) {
            repo.merge(module, data);
        } else {
            const guild = await GuildService.findOrCreate(guildId);

            module = repo.create({
                guild,
                guildId,
                ...data
            }) as ModuleEntity<K>;
        }

        return await repo.save(module);
    }

    static async toggleField<K extends ModuleName>(
        guildId: string,
        moduleName: K,
        fieldName: BooleanKeys<EntityOf<typeof this.repo[K]>>
    ) {
        const module = await this.findOrCreate(guildId, moduleName);

        const repo = this.repo[moduleName];
        const payload = {
            [fieldName]: !module[fieldName]
        }

        await repo.update({ guildId }, payload);

        return {
            ...module,
            ...payload
        } as ModuleEntity<K>
    }

    static async toggleModule<K extends ModuleName>(guildId: string, moduleName: K) {
        return await this.toggleField(guildId, moduleName, 'enabled');
    }

    static async resetModule<K extends ModuleName>(guildId: string, moduleName: K) {
        const defaultModuleOptions = (Modules as any)[`default${moduleName.toCapitalize()}Module`];
        if (!defaultModuleOptions) {
            return await this.findByName(guildId, moduleName);
        }

        const { enabled, ...options } = defaultModuleOptions

        return await this.updateOrCreate(guildId, moduleName, options) as ModuleEntity<K>;
    }
}