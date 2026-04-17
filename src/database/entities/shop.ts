import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    PrimaryColumn,
    CreateDateColumn,
} from 'typeorm';

import { Guild } from './guild'
import { ShopItem } from './shop-items'

@Entity()
export class Shop {
    @PrimaryColumn({ type: 'bigint' })
    guildId: string;

    @PrimaryColumn({ type: 'bigint' })
    name: string;

    @ManyToOne(() => Guild, (guild) => guild.shops, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'boolean', default: true })
    isOpen: boolean;

    @Column({ type: 'boolean', default: false })
    useTagDiscount: boolean;

    @Column({ type: 'int', nullable: true })
    color?: number;

    @Column({ type: 'text' })
    description?: string;

    @Column({ type: 'varchar', length: 32, nullable: true })
    emoji?: string;

    @Column({ type: 'text', nullable: true })
    bannerUrl?: string;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => ShopItem, (item) => item.shop)
    items: ShopItem[];
}