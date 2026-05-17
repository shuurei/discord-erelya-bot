import { DeepPartial, FindOptionsWhere } from 'typeorm'
import { UserEntityFlag } from '@/utils'

import { User } from '../entities/User'
import db from '../db'

export class UserService {
    static get repo() {
        return db.getRepository(User);
    }

    // -- CRUD -- //
    static async findById(userId: string, options?: Omit<FindOptionsWhere<User>, 'id'>) {
        return await this.repo.findOneBy({ ...options, id: userId });
    }

    static async findOrCreate(userId: string, options?: Omit<FindOptionsWhere<User>, 'id'>) {
        await this.repo.upsert(
            { id: userId, ...(options as any) },
            { conflictPaths: ['id'], skipUpdateIfNoValuesChanged: true }
        );

        return await this.repo.findOneBy({ id: userId, ...options }) as User;
    }

    static async updateOrCreate(userId: string, data?: DeepPartial<User>) {
        await this.repo.upsert({ id: userId, ...data }, ['id']);
        return await this.findById(userId);
    }

    static async deleteByUserId(userId: string) {
        return await this.repo.delete({ id: userId });
    }

    // -- Flags -- //
    static async addFlag(userId: string, flag: UserEntityFlag) {
        const user = await this.findOrCreate(userId);
        user.flags = user.flagsBitField.add(flag).bitfield;

        return await this.repo.save(user);
    }

    static async removeFlag(userId: string, flag: UserEntityFlag) {
        const user = await this.findOrCreate(userId);
        user.flags = user.flagsBitField.remove(flag).bitfield;

        return await this.repo.save(user);
    }

    static async hasFlag(userId: string, flag: UserEntityFlag) {
        const user = await this.findById(userId);
        return user?.flagsBitField.has(flag) ?? false;
    }

    // -- Tag -- //
    static async setTagAssignedAt(userId: string, date: Date | null = new Date()) {
        return await this.updateOrCreate(userId, { tagAssignedAt: date });
    }

    static async resetTagAssignedAt(userId: string) {
        return await this.setTagAssignedAt(userId, null);
    }
}