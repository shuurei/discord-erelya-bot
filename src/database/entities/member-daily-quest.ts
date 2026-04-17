import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm'

import { Member } from './member'

@Entity()
export class MemberDailyQuest {
    @PrimaryColumn({ type: 'bigint' })
    userId: string;

    @PrimaryColumn({ type: 'bigint' })
    guildId: string;

    @ManyToOne(() => Member, (member) => member.dailyQuests, {
        onDelete: 'CASCADE',
    })
    @JoinColumn([
        { name: 'userId', referencedColumnName: 'userId' },
        { name: 'guildId', referencedColumnName: 'guildId' },
    ])
    member: Member;

    @Column({ type: 'int', nullable: true })
    voiceMinutesTarget?: number;

    @Column({ type: 'int', nullable: true })
    messagesSentTarget?: number;

    @Column({ type: 'int', default: 0 })
    voiceMinutesProgress: number;

    @Column({ type: 'int', default: 0 })
    messagesSentProgress: number;

    @Column({ type: 'timestamp', nullable: true })
    startAt?: Date;

    @Column({ type: 'boolean', default: false })
    isClaimed: boolean;
}