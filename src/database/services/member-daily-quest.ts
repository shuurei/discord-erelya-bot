import db from '@/database/db'
import { MemberDailyQuestCreateInput } from '../core/models'

interface MemberDailyQuestWhere {
    guildId: string;
    userId: string;
}

type MemberDailyQuestCreateInputWithoutMember = Omit<MemberDailyQuestCreateInput, 'member'>

class MemberDailyQuestService {
    constructor(public model: typeof db.memberDailyQuest) { }

    // -- Utils -- //
    private _buildWhere(where: MemberDailyQuestWhere) {
        return { userId_guildId: where }
    }

    private _connectOrCreateMember(where: MemberDailyQuestWhere) {
        return {
            member: {
                connectOrCreate: {
                    where: {
                        userId_guildId: where
                    },
                    create: {
                        user: {
                            connectOrCreate: {
                                where: { id: where.userId },
                                create: { id: where.userId }
                            }
                        },
                        guild: {
                            connectOrCreate: {
                                where: { id: where.guildId },
                                create: { id: where.guildId }
                            }
                        }
                    }
                }
            }
        };
    }

    // -- CRUD -- //
    async findById(where: MemberDailyQuestWhere) {
        return await this.model.findUnique({
            where: this._buildWhere(where),
        });
    }

    async create(where: MemberDailyQuestWhere, data: Partial<MemberDailyQuestCreateInputWithoutMember>) {
        return await this.model.create({
            data: {
                ...this._connectOrCreateMember(where),
                ...data
            }
        });
    }

    async findOrCreate(where: MemberDailyQuestWhere, data?: Partial<MemberDailyQuestCreateInputWithoutMember>) {
        return await this.model.upsert({
            where: this._buildWhere(where),
            update: {},
            create: {
                ...data,
                ...this._connectOrCreateMember(where)
            }
        });
    }

    async updateOrCreate(where: MemberDailyQuestWhere, data: Partial<MemberDailyQuestCreateInputWithoutMember>) {
        return await this.model.upsert({
            where: this._buildWhere(where),
            update: data,
            create: {
                ...data,
                ...this._connectOrCreateMember(where)
            }
        });
    }

    async remove(where: MemberDailyQuestWhere) {
        return await this.model.delete({
            where: this._buildWhere(where)
        });
    }
}

export const memberDailyQuestService = new MemberDailyQuestService(db.memberDailyQuest);