import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { enumType, timestampType } from '@/utils'

import { Member } from './Member'

export enum BankProtectionType {
    HEIST_DEFENSE = 'HEIST_DEFENSE',
    ALARM = 'ALARM',
    STASH = 'STASH',
}

export enum BankProtectionRank {
    X = 'X',
    S = 'S',
    A = 'A',
    D = 'D',
    B = 'B',
    C = 'C',
    E = 'E',
    F = 'F'
}

@Entity()
export class BankProtection {
    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @Column({ type: enumType(), enum: BankProtectionRank })
    rank: BankProtectionRank;

    @PrimaryColumn({ type: enumType(), enum: BankProtectionType })
    type: BankProtectionType;

    @CreateDateColumn({ type: timestampType() })
    createdAt: Date;

    @ManyToOne(() => Member, ({ bankProtections }) => bankProtections, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn([
        { name: 'userId', referencedColumnName: 'userId' },
        { name: 'guildId', referencedColumnName: 'guildId' }
    ])
    member: Member;
}