import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Guild } from '../Guild'

export const defaultQuestModule = {
    isMessageQuestEnabled: true,
    isVoiceQuestEnabeld: true,
} as const;

@Entity()
export class QuestModule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @ManyToOne(() => Guild, (guild) => guild.eventModule, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @Column({ type: 'boolean', default: false })
    enabled: boolean;

    // Global
    @Column({ type: 'boolean', default: true })
    isMessageQuestEnabled: boolean;
    @Column({ type: 'boolean', default: true })
    isVoiceQuestEnabeld: boolean;
}