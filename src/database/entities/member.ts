import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
    OneToOne,
    OneToMany,
} from 'typeorm'

import { User } from './user'
import { Guild } from './guild'
import { MemberVault } from './member-vault'
import { MemberDailyQuest } from './member-daily-quest'

@Entity()
export class Member {
    @PrimaryColumn({ type: 'bigint' })
    userId: string;

    @PrimaryColumn({ type: 'bigint' })
    guildId: string;

    @ManyToOne(() => User, (user) => user.guilds, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User

    @ManyToOne(() => Guild, (guild) => guild.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

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

    @Column({ type: 'timestamp', nullable: true })
    lastAttendedAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastWorkedAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastRobbedAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastRobAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastHeistAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastHeistedAt?: Date;

    @OneToOne(() => MemberVault, (vault) => vault.member)
    vault?: MemberVault;

    @OneToMany(() => MemberDailyQuest, (quest) => quest.member)
    dailyQuests: MemberDailyQuest[];
}