import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
    CreateDateColumn,
} from 'typeorm'

import { Guild } from './guild'
import { Shop } from './shop'

@Entity()
export class ShopItem {
    @PrimaryColumn({ type: 'bigint' })
    guildId: string;

    @PrimaryColumn({ type: 'bigint' })
    roleId: string;

    @ManyToOne(() => Guild, (guild) => guild.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'string' })
    shopName: string;

    @ManyToOne(() => Shop, (shop) => shop.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn([
        { name: 'guildId', referencedColumnName: 'guildId' },
        { name: 'shopName', referencedColumnName: 'name' },
    ])
    shop: Shop;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'int' })
    cost: number;

    @Column({ type: 'int', nullable: true })
    stock?: number;

    @CreateDateColumn()
    createdAt: Date;
}