import { ClientEvents, Message, ChatInputCommandInteraction, ButtonInteraction } from 'discord.js'
import { CustomClient, CustomClientHub } from './CustomClient'
import { Command } from './Command'

export interface CustomClientEvents extends ClientEvents {
    buttonInteractionCreate: [ButtonInteraction];
    slashCommandCreate: [ChatInputCommandInteraction],
    commandCreate: [{
        command: Command;
        messageOrInteraction : Message | ChatInputCommandInteraction;
        args?: (any | null)[];
    }];
    hubReady: [CustomClientHub];
};

export interface EventRunArgs<Event extends keyof CustomClientEvents> {
    events: CustomClientEvents[Event];
}

export interface EventOptions<Event extends keyof CustomClientEvents> {
    name: Event;
    once?: boolean;
    run(
        this: this & { client: CustomClient; },
        options: EventRunArgs<Event>
    ): any;
}

export class Event<Event extends keyof CustomClientEvents> {
    name: Event;
    once?: boolean;
    run: (options: EventRunArgs<Event>) => any;

    constructor(data: EventOptions<Event>) {
        if (typeof data.run !== 'function') {
            throw new Error('The "run" property must be a function !');
        }

        Object.assign(this, data);
    }
}

export default Event;