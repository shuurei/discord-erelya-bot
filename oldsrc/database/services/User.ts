import { DeepPartial, FindOptionsWhere } from 'typeorm'

import dataSource from '../data-source'

import { User } from '../entities/User'
import { UserEntityFlag, UserEntityFlagsBitField } from '../utils'

export class UserService {
    static repo = dataSource.getRepository(User);

    static async findById(userId: string, options?: Omit<FindOptionsWhere<User>, 'id'>) {
        return await this.repo.findOneBy({
            ...options,
            id: userId
        });
    }

    static async findOrCreate(userId: string, options?: Omit<FindOptionsWhere<User>, 'id'>) {
        const payload = { ...options, id: userId }
        let user = await this.repo.findOneBy(payload);

        if (!user) {
            user = this.repo.create(payload as DeepPartial<User>);
            await this.repo.save(user);
        }

        return user;
    }

    static async updateOrCreate(userId: string, data?: DeepPartial<User>) {
        await this.repo.upsert({
            id: userId,
            ...data,
        }, ['id']);

        return await this.findById(userId);
    }

    static async deleteByUserId(userId: string) {
        return await this.repo.delete({ id: userId });
    }

    // -- Flags -- //
    static async addFlag(userId: string, flag: UserEntityFlag) {
        let user = await this.findById(userId);

        if (user) {
            user.flags = user.flagsBitField.add(flag).bitfield;
        } else {
            user = this.repo.create({
                id: userId,
                flags: new UserEntityFlagsBitField().add(flag).bitfield
            });
        }

        return await this.repo.save(user);
    }

    static async removeFlag(userId: string, flag: UserEntityFlag) {
        let user = await this.findById(userId);

        if (user) {
            user.flags = user.flagsBitField.remove(flag).bitfield;
        } else {
            user = this.repo.create({ id: userId });
        }

        return await this.repo.save(user);
    }

    // -- Tag -- //
    static async setTagAssignedAt(userId: string, date?: Date | null) {
        return this.updateOrCreate(userId, {
            tagAssignedAt: date ?? new Date()
        });
    }

    static async resetTagAssignedAt(userId: string) {
        return this.setTagAssignedAt(userId, null);
    }
}