import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn } from 'typeorm'
import { timestampType, UserEntityFlagsBitField } from '@/utils'
import { Member } from './Member'

@Entity()
export class User {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @Column({ type: 'int', default: 0 })
    flags: number;

    @Column({ type: timestampType(), nullable: true })
    tagAssignedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Member, (member) => member.user)
    guilds: Member[];

    get flagsBitField() {
        return new UserEntityFlagsBitField(this.flags);
    }
}