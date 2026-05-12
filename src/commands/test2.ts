import { Command, FastComponent, FastContainer, FastEmbed } from '@/core'
import { ChannelType, MessageFlags } from 'discord.js'

export default new Command({
    access: {
        user: { isDeveloper: true }
    },
    async onMessage(message, { args: [] }) {
        // this.client.jobs.stop('tick');
        await this.client.jobs.restart('tick');
        // console.log(this.client.jobs.cache.get('tick'))
    }
});