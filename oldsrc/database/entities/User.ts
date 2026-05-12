import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm'

import { UserEntityFlagsBitField } from '../utils'

import { Member } from './Member'

@Entity()
export class User {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @Column({ type: 'int', default: 0 })
    flags: number;

    @OneToMany(() => Member, (member) => member.user)
    guilds: Member[];

    @Column({ type: 'timestamp', nullable: true })
    tagAssignedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    get flagsBitField() {
        return new UserEntityFlagsBitField(this.flags);
    }
}