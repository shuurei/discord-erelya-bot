import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm'

import { Member } from './member'
import { Blacklist } from './blacklist'

@Entity()
export class User {
    @PrimaryColumn({ type: 'bigint' })
    id: string;

    @Column({ type: 'int', default: 0 })
    flags: number;

    @OneToMany(() => Member, (member) => member.user)
    guilds: Member[];

    @OneToMany(() => Blacklist, (blacklist) => blacklist.target)
    blacklistsAsTarget: Blacklist[];

    @OneToMany(() => Blacklist, (blacklist) => blacklist.author)
    blacklistsAsAuthor: Blacklist[];

    @OneToMany(() => Blacklist, (blacklist) => blacklist.cleaner)
    blacklistsAsCleaner: Blacklist[];

    @Column({ type: 'timestamp', nullable: true })
    tagAssignedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;
}