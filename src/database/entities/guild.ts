import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm'

import { Member } from './member'
import { Blacklist } from './blacklist'
import { GuildModule } from './guild-settings'
import { ChannelBlacklist } from './channel-blacklist'
import { BlacklistDerogation } from './blacklist-derogation'
import { GuildLevelReward } from './guild-level-reward'
import { ShopItem } from './shop-items'
import { Shop } from './shop'

@Entity()
export class Guild {
    @PrimaryColumn({ type: 'bigint' })
    id: string;

    @Column({ type: 'varchar', nullable: true })
    welcomeChannelId?: string;

    @Column({ type: 'varchar', nullable: true })
    supportRoleId?: string;

    @Column({ type: 'varchar', nullable: true })
    messageDeletedAuditChannelId?: string;

    @Column({ type: 'varchar', nullable: true })
    messageEditedAuditChannelId?: string;

    @Column({ type: 'timestamp', nullable: true })
    lastEventAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Member, (member) => member.guild)
    members: Member[];

    @OneToMany(() => GuildLevelReward, (reward) => reward.guild)
    levelRewards: GuildLevelReward[];

    @OneToMany(() => ChannelBlacklist, (cb) => cb.guild)
    channelBlacklist: ChannelBlacklist[];

    @OneToMany(() => Shop, (shop) => shop.guild)
    shops: Shop[];

    @OneToMany(() => ShopItem, (item) => item.guild)
    items: ShopItem[];

    @OneToMany(() => GuildModule, (module) => module.guild)
    modules: GuildModule[];

    @OneToMany(() => Blacklist, (blacklist) => blacklist.guild)
    blacklists: Blacklist[];

    @OneToMany(() => BlacklistDerogation, (derogation) => derogation.guild)
    derogations: BlacklistDerogation[];
}