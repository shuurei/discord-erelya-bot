import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm'

import { Member } from './member'

export enum MemberVaultCapacityTier {
    TIER_0 = 'TIER_0',
    TIER_1 = 'TIER_1',
    TIER_2 = 'TIER_2',
    TIER_3 = 'TIER_3',
    TIER_4 = 'TIER_4',
    TIER_5 = 'TIER_5',
    TIER_6 = 'TIER_6',
    TIER_7 = 'TIER_7',
    TIER_8 = 'TIER_8',
}

export enum MemberVaultSecurityTier {
    TIER_0 = 'TIER_0',
    TIER_1 = 'TIER_1',
    TIER_2 = 'TIER_2',
}

@Entity()
export class MemberVault {
    @PrimaryColumn({ type: 'bigint' })
    userId: string;

    @PrimaryColumn({ type: 'bigint' })
    guildId: string;

    @OneToOne(() => Member, (member) => member.vault, { onDelete: 'CASCADE' })
    @JoinColumn([
        { name: 'userId', referencedColumnName: 'userId' },
        { name: 'guildId', referencedColumnName: 'guildId' },
    ])
    member: Member;

    @Column({
        type: 'enum',
        enum: MemberVaultCapacityTier,
        default: MemberVaultCapacityTier.TIER_0,
    })
    capacityTier: MemberVaultCapacityTier;

    @Column({
        type: 'enum',
        enum: MemberVaultSecurityTier,
        default: MemberVaultSecurityTier.TIER_0,
    })
    securityTier: MemberVaultSecurityTier;

    @Column({ type: 'int', default: 0 })
    guildCoins: number;
}