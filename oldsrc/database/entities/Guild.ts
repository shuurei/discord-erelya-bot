import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm'

import { Shop } from './Shop'
import { Member } from './Member'
import { ShopItem } from './ShopItems'
import { ActivityRule } from './ActivityRule'
import { GuildLevelReward } from './GuildLevelReward'

import {
    AnnouncementModule,
    ModerationModule,
    EconomyModule,
    LevelModule,
    EventModule,
    QuestModule,
} from './modules'

@Entity()
export class Guild {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @Column({ type: 'varchar', nullable: true })
    welcomeChannelId: string | null;

    @Column({ type: 'varchar', nullable: true })
    supportRoleId: string | null;

    @Column({ type: 'varchar', nullable: true })
    messageDeletedAuditChannelId: string | null;

    @Column({ type: 'varchar', nullable: true })
    messageEditedAuditChannelId: string | null;

    @Column({ type: 'timestamp', nullable: true })
    lastEventAt: Date | null;

    @OneToMany(() => Member, (member) => member.guild)
    members: Member[];

    @OneToMany(() => GuildLevelReward, (reward) => reward.guild)
    levelRewards: GuildLevelReward[];

    @OneToMany(() => ActivityRule, (ar) => ar.guild)
    activityRules: ActivityRule[];

    @OneToMany(() => Shop, (shop) => shop.guild)
    shops: Shop[];

    @OneToMany(() => ShopItem, (item) => item.guild)
    items: ShopItem[];

    // Modules
    @OneToMany(() => LevelModule, (module) => module.guild, { cascade: true })
    levelModule: LevelModule;
    @OneToMany(() => EconomyModule, (module) => module.guild, { cascade: true })
    economyModule: EconomyModule;
    @OneToMany(() => EventModule, (module) => module.guild, { cascade: true })
    eventModule: EventModule;
    @OneToMany(() => AnnouncementModule, (module) => module.guild, { cascade: true })
    announcementModule: AnnouncementModule;
    @OneToMany(() => QuestModule, (module) => module.guild, { cascade: true })
    questModule: QuestModule;
    @OneToMany(() => ModerationModule, (module) => module.guild, { cascade: true })
    moderationModule: ModerationModule;

    @CreateDateColumn()
    createdAt: Date;
}