import { Command } from '@/core'
import { ModuleService } from '@/database/services';
import { jsonToMarkdown } from '@/utils';

export default new Command({
    access: {
        user: { isDeveloper: true },
    },
    async onMessage(message, { args: [], dbc }) {
        const data = await ModuleService.findOrCreate(message.guild.id, 'economy')

        return await message.reply(jsonToMarkdown(data));
        // this.client.jobs.stop('tick');

        // console.log(this.client.jobs.cache.get('tick'))
    }
});