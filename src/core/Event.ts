import {
    ChatInputCommandInteraction, 
    ButtonInteraction,
    ClientEvents,
    Guild,
    Message,
    Client,
} from 'discord.js'

import { CustomClient } from './CustomClient'
import { Command } from './Command'

export interface CustomClientEvents extends ClientEvents {
    // chatInputInteractionCreate: [ChatInputCommandInteraction];
    // buttonInteractionCreate: [ButtonInteraction];
    slashCommandCreate: [ChatInputCommandInteraction],
    commandCreate: [{
        command: Command;
        messageOrInteraction : Message | ChatInputCommandInteraction;
        args?: (string | null)[];
    }];
    // hubReady: [Guild];
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