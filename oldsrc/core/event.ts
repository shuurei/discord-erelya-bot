import {
    ChatInputCommandInteraction, 
    ButtonInteraction,
    ClientEvents as DiscordClientEvents,
    Guild,
    Message,
    Client,
} from 'discord.js'

import { Command, DatabaseContext } from './command'

export interface ClientEvents extends DiscordClientEvents {
    chatInputInteractionCreate: [ChatInputCommandInteraction];
    buttonInteractionCreate: [ButtonInteraction];
    commandCreate: [Command, Message | ChatInputCommandInteraction, DatabaseContext, string[] | null[]];
    hubReady: [Guild];
    clientSetup: [Client];
};

export interface EventRunOptions<Event extends keyof ClientEvents> {
    events: ClientEvents[Event];
}

export interface EventOptions<Event extends keyof ClientEvents> {
    name: Event;
    once?: boolean;
    run(
        this: this & { client: ClientEvents; },
        options: EventRunOptions<Event>
    ): any;
}

export class Event<Event extends keyof ClientEvents> {
    name: Event;
    once: boolean;

    run: (options: EventRunOptions<Event>) => any;

    constructor(data: EventOptions<Event>) {
        if (typeof data.run !== 'function') {
            throw new Error('The "run" property must be a function !');
        }

        Object.assign(this, data);
    }
}

export default Event;