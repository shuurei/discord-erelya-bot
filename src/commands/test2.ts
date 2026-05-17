import { Command, FastComponent } from '@/core'

export default new Command({
    access: {
        user: { isDeveloper: true },
    },
    async onMessage(message, { args: [], dbc }) {
        return await message.reply([
            `Fatigue de Pierre`,
            FastComponent.createProgressBar(0.67, { showPercentage: true, useDefaultChar: true })
        ].join('\n'));
        // this.client.jobs.stop('tick');

        // console.log(this.client.jobs.cache.get('tick'))
    }
});