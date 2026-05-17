import { DeepPartial, MoreThan } from 'typeorm'

import dataSource from '../db'
import { Member } from '../entities/Member'

import { UserService } from './UserService'
import { GuildService } from './GuildService'

import { levelToXp } from '@/utils'

type MemberWhere = Required<Pick<DeepPartial<Member>, 'userId' | 'guildId'>>

const CONFLICT = { conflictPaths: ['userId', 'guildId'], skipUpdateIfNoValuesChanged: true };

export class MemberService {
    static get repo() {
        return dataSource.getRepository(Member);
    }

    private static async ensureUserAndGuild({ userId, guildId }: MemberWhere) {
        const [user, guild] = await Promise.all([
            UserService.findOrCreate(userId),
            GuildService.findOrCreate(guildId),
        ]);

        return { user, guild };
    }

    private static async setNumberField(where: MemberWhere, field: keyof DeepPartial<Member>, value: number) {
        return await this.updateOrCreate(where, { [field]: value });
    }

    // -- CRUD -- //
    static async findOrCreate(where: MemberWhere, relations: (keyof Member)[] = []) {
        await this.repo.upsert({
            ...where,
            ...await this.ensureUserAndGuild(where)
        }, CONFLICT);

        return await this.repo.findOne({ where, relations }) as Member;
    }

    static async updateOrCreate(where: MemberWhere, data: DeepPartial<Member>) {
        const member = await this.repo.findOneBy(where);

        if (member) {
            this.repo.merge(member, data);
            return await this.repo.save(member);
        }

        return await this.repo.save(this.repo.create({
            ...data,
            ...where,
            ...await this.ensureUserAndGuild(where)
        }));
    }

    static async incrementOrCreate(where: MemberWhere, field: keyof Member, amount: number) {
        return await this.repo.manager.transaction(async ({ getRepository }) => {
            const repo = getRepository(Member);

            try {
                await repo.increment(where, field, amount);
            } catch {
                await repo.save(repo.create({
                    ...where,
                    ...await this.ensureUserAndGuild(where),
                    [field]: Math.max(0, amount),
                }));
            }

            return repo.findOneBy(where);
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
    static async setLastWorkedAt(where: MemberWhere, date = new Date()) {
        return await this.updateOrCreate(where, { lastWorkedAt: date });
    }

    static async setLastHeistAt(where: MemberWhere, date = new Date()) {
        return await this.updateOrCreate(where, { lastHeistAt: date });
    }

    // -- Leaderboard -- //
    static async getActivityXpRank(where: MemberWhere) {
        const member = await this.findOrCreate(where);

        const [rank, total] = await Promise.all([
            this.repo.count({ where: { guildId: where.guildId, activityXp: MoreThan(member.activityXp) } }),
            this.repo.count({ where: { guildId: where.guildId, activityXp: MoreThan(0) } }),
        ]);

        return { rank: rank + 1, total };
    }
}