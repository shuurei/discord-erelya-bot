import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { timestampType } from '@/utils'

import { Member } from './Member'

@Entity()
export class MemberDailyQuest {
    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @ManyToOne(() => Member, (member) => member.dailyQuests, { onDelete: 'CASCADE' })
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

    @Column({ type: timestampType(), nullable: true })
    startAt?: Date;

    @Column({ type: 'boolean', default: false })
    isClaimed: boolean;
}