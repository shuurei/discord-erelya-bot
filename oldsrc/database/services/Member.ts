import { DeepPartial, MoreThan } from 'typeorm'

import dataSource from '../data-source'
import { Member } from '../entities/Member'

import { UserService } from './User'
import { GuildService } from './Guild'

import { levelToXp } from '@/utils'

type MemberWhere = Required<Pick<DeepPartial<Member>, 'userId' | 'guildId'>>

export class MemberService {
    static repo = dataSource.getRepository(Member);

    private static async ensureUserAndGuild({ userId, guildId }: MemberWhere) {
        return {
            user: await UserService.findOrCreate(userId),
            guild: await GuildService.findOrCreate(guildId)
        };
    }

    private static async setCooldown(where: MemberWhere, field: keyof DeepPartial<Member>, date?: Date) {
        return await this.updateOrCreate(where, { [field]: date ?? new Date() });
    }

    private static async setNumberField(where: MemberWhere, field: keyof DeepPartial<Member>, value: number) {
        return await this.updateOrCreate(where, {
            [field]: value
        });
    }

    static async findOrCreate(where: MemberWhere) {
        let member = await this.repo.findOneBy(where);

        if (!member) {
            const { user, guild } = await this.ensureUserAndGuild(where);

            member = this.repo.create({
                userId: where.userId,
                guildId: where.guildId,
                user,
                guild,
            });

            await this.repo.save(member);
        }

        return member;
    }

    static async updateOrCreate(where: MemberWhere, data: DeepPartial<Member>) {
        let member = await this.repo.findOneBy(where);

        if (member) {
            this.repo.merge(member, data);
        } else {
            const { user, guild } = await this.ensureUserAndGuild(where);

            member = this.repo.create({
                ...data,
                userId: where.userId,
                guildId: where.guildId,
                user,
                guild,
            });
        }

        return await this.repo.save(member);
    }

    static async incrementOrCreate(where: MemberWhere, field: keyof Member, amount: number) {
        return await this.repo.manager.transaction(async (manager) => {
            const repo = manager.getRepository(Member);

            const { affected } = await repo.increment(where, field, amount);

            if (affected === 0) {
                const { user, guild } = await this.ensureUserAndGuild(where);

                await repo.save(
                    repo.create({
                        userId: where.userId,
                        guildId: where.guildId,
                        user,
                        guild,
                        [field]: Math.max(0, amount),
                    })
                );
            }

            return await repo.findOneBy(where);
        });
    }

    // -- Guild Coins -- //
    static async addGuildCoins(where: MemberWhere, amount: number) {
        return await this.incrementOrCreate(where, 'guildCoins', amount);
    }

    static async removeGuildCoins(where: MemberWhere, amount: number) {
        return await this.incrementOrCreate(where, 'guildCoins', -amount);
    }

    // -- Activity XP -- //
    static async addActivityXp(where: MemberWhere, amount: number) {
        return await this.incrementOrCreate(where, 'activityXp', amount);
    }

    static async removeActivityXp(where: MemberWhere, amount: number) {
        return await this.incrementOrCreate(where, 'activityXp', -amount);
    }

    static async setActivityXp(where: MemberWhere, value: number) {
        return await this.setNumberField(where, 'activityXp', value);
    }

    // -- Level -- //
    static async addLevel(where: MemberWhere, amount: number) {
        return await this.addActivityXp(where, levelToXp(amount));
    }

    static async removeLevel(where: MemberWhere, amount: number) {
        return await this.removeActivityXp(where, levelToXp(amount));
    }

    static async setLevel(where: MemberWhere, value: number) {
        return await this.setActivityXp(where, levelToXp(value));
    }

    // -- Stats -- //
    static async incrementMessageCount(where: MemberWhere) {
        return await this.incrementOrCreate(where, 'messageCount', 1);
    }

    static async incrementDailyStreak(where: MemberWhere) {
        return await this.incrementOrCreate(where, 'dailyStreak', 1);
    }

    static async resetDailyStreak(where: MemberWhere) {
        return await this.setNumberField(where, 'dailyStreak', 1);
    }

    static async resetAllStats(where: MemberWhere) {
        return await this.updateOrCreate(where, {
            messageCount: 0,
            dailyStreak: 0,
        });
    }

    // -- Cooldowns -- //
    static async setLastWorkedAt(where: MemberWhere, date?: Date) {
        return await this.setCooldown(where, 'lastWorkedAt', date);
    }

    static async setLastRobAt(where: MemberWhere, date?: Date) {
        return await this.setCooldown(where, 'lastRobAt', date);
    }

    // -- Leaderboard -- //
    static async getActivityXpRank(where: MemberWhere) {
        const member = await this.findOrCreate(where);

        const [higher, total] = await Promise.all([
            this.repo.count({
                where: {
                    guildId: where.guildId,
                    activityXp: MoreThan(member.activityXp),
                },
            }),
            this.repo.count({
                where: {
                    guildId: where.guildId,
                    activityXp: MoreThan(0),
                },
            }),
        ]);

        return {
            rank: higher + 1,
            total,
        };
    }
}