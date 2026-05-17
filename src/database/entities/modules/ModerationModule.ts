import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Guild } from '../Guild'

export const defaultModerationModule = {

} as const;

@Entity()
export class ModerationModule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @ManyToOne(() => Guild, (guild) => guild.eventModule, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'boolean', default: false })
    enabled: boolean;
}