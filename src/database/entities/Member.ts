import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, OneToMany } from 'typeorm'
import { timestampType, xpToLevel } from '@/utils'

import { MemberDailyQuest } from './MemberDailyQuest'
import { Guild } from './Guild'
import { User } from './User'
import { BankProtection } from './BankProtection'

@Entity()
export class Member {
    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'int', default: 0 })
    activityXp: number;

    @Column({ type: 'int', default: 0 })
    guildCoins: number;

    @Column({ type: 'int', default: 0 })
    messageCount: number;

    @Column({ type: 'int', default: 0 })
    callPrivateMinutes: number;

    @Column({ type: 'int', default: 0 })
    callPublicMinutes: number;

    @Column({ type: 'int', default: 0 })
    callActiveMinutes: number;

    @Column({ type: 'int', default: 0 })
    callDeafMinutes: number;

    @Column({ type: 'int', default: 0 })
    callMutedMinutes: number;

    @Column({ type: 'int', default: 0 })
    callStreamingMinutes: number;

    @Column({ type: 'int', default: 0 })
    callCameraMinutes: number;

    @Column({ type: 'int', default: 0 })
    dailyStreak: number;

    @Column({ type: timestampType(), nullable: true })
    lastAttendedAt: Date | null;

    @Column({ type: timestampType(), nullable: true })
    lastWorkedAt: Date | null;

    @Column({ type: timestampType(), nullable: true })
    lastHeistAt: Date | null;

    @Column({ type: timestampType(), nullable: true })
    lastHeistedAt: Date | null;

    @OneToMany(() => MemberDailyQuest, (quest) => quest.member)
    dailyQuests: MemberDailyQuest[];

    @OneToMany(() => BankProtection, ({ member }) => member)
    bankProtections: BankProtection[];

    @ManyToOne(() => User, ({ guilds }) => guilds, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User

    @ManyToOne(() => Guild, ({ members }) => members, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    get activityLevel(): number {
        return xpToLevel(this.activityXp);
    }
}