// //     // -- CRUD -- //
// //     async findMany({ guildId, channelId }: { guildId: string, channelId: string }) {
// //         const rows = await this.model.findMany({
// //             where: { guildId, channelId },
// //             select: { scope: true },
// //             distinct: ['scope'],
// //         });

// //         return rows.reduce<Record<string, boolean>>((acc, { scope }) => {
// //             acc[scope] = true;

// //             return acc;
// //         }, {}) as Record<BlacklistScope, boolean>;
// //     }

// //     async has(where: ChannelBlacklistWhere) {
// //         const channel = await this.model.findUnique({
// //             where: this._buildWhere(where)
// //         });

// //         return !!channel;
// //     }

// //     async hasAny(where: {
// //         guildId: string;
// //         scope: BlacklistScope;
// //         channelIds: string[];
// //     }) {
// //         if (!where.channelIds.length) return false;

// //         const channel = await this.model.findFirst({
// //             where: {
// //                 guildId: where.guildId,
// //                 scope: where.scope,
// //                 channelId: {
// //                     in: where.channelIds,
// //                 },
// //             },
// //         });

// //         return !!channel;
// //     }

// //     async add(where: ChannelBlacklistWhere) {
// //         const { scope, channelId } = where;

// //         return await this.model.upsert({
// //             where: this._buildWhere(where),
// //             update: {},
// //             create: {
// //                 scope,
// //                 channelId,
// //                 ...this._connectOrCreateGuild(where)
// //             }
// //         });
// //     }

// //     async remove(where: ChannelBlacklistWhere) {
// //         return await this.model.delete({
// //             where: this._buildWhere(where)
// //         });
// //     }

// //     async clear(where: { guildId: string; scope: BlacklistScope; channelId?: string }) {
// //         const { guildId, scope, channelId } = where;

// //         return await this.model.deleteMany({
// //             where: { channelId, guildId, scope }
// //         });
// //     }
// // }

// // export const channelBlacklistService = new ChannelBlacklistService(db.channelBlacklist);

// import { DeepPartial } from 'typeorm'

// import dataSource from '../data-source'
// import { ChannelBlacklist } from '../entities/ChannelBlacklist'

// import { GuildService } from './Guild'

// type ChannelBlacklistWhere = Required<Pick<DeepPartial<ChannelBlacklist>, 'channelId' | 'guildId' | 'scope'>>

// export class ChannelBlacklistService {
//     static repo = dataSource.getRepository(ChannelBlacklist);

//     static async findBy(where: ChannelBlacklistWhere) {
//         return await this.repo.findOneBy(where);
//     }

//     static async add(where: ChannelBlacklistWhere) {
//         const { channelId, guildId, scope } = where;

//         let channel = await this.findBy(where);
        
//         if (!channel) {
//             const guild = await GuildService.findOrCreate(guildId)

//             channel = this.repo.create({
//                 guildId,
//                 channelId,
//                 scope,
//                 guild
//             });

//             await this.repo.save(channel);
//         }

//         return channel;
//     }
// }