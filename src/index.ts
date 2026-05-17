import 'dotenv/config'
await import ('reflect-metadata');

import os from 'os'
import path from 'path'
import { GlobalFonts } from '@napi-rs/canvas'
import { version as djsVersion } from 'discord.js'

import { env } from './utils'
import client from './client'
import { logger } from './core'

import pkg from '@pkg'

GlobalFonts.registerFromPath(path.join(
    process.cwd(),
    'src',
    'assets',
    'fonts',
    'Quantico-Bold.ttf'
), 'Quantico Bold');

const ASCII_LOGO = [
    `@@@@@@@@  @@@@@@@   @@@@@@@@  @@@       @@@ @@@   @@@@@@`,
    `@@@@@@@@  @@@@@@@@  @@@@@@@@  @@@       @@@ @@@  @@@@@@@@`,
    `@@!       @@!  @@@  @@!       @@!       @@! !@@  @@!  @@@`,
    `!@!       !@!  @!@  !@!       !@!       !@! @!!  !@!  @!@`,
    `@!!!:!    @!@!!@!   @!!!:!    @!!        !@!@!   @!@!@!@!`,
    `!!!!!:    !!@!@!    !!!!!:    !!!         @!!!   !!!@!!!!`,
    `!!:       !!: :!!   !!:       !!:         !!:    !!:  !!!`,
    `:!:       :!:  !:!  :!:        :!:        :!:    :!:  !:!`,
    ` :: ::::  ::   :::   :: ::::   :: ::::     ::    ::   :::`,
    `: :: ::    :   : :  : :: ::   : :: : :     :      :   : :`
] as const;

logger.defaultMaxLineLength = ASCII_LOGO[1].length;

process.title = `${pkg.name.toUpperCase()} - Terminal`

logger.log(({ gradient }) =>
    ASCII_LOGO.map((line) => gradient('#5053ff', '#9650ff', line)).join('\n')
);

logger.header(({ custom }) => custom(env.isDev ? '#ff8f8f' : env.isProd ? '#8fffab' : '#ffe18f', `✦ ${env.STAGE} - v${pkg.version} ✦`));
logger.list([
    {
        label: 'DiscordJs',
        value: `v${djsVersion}`
    },
    {
        label: 'NodeJs',
        value: process.version
    }
])
logger.header(({ purpleBright }) => purpleBright('✦ OPERATING SYSTEM ✦'));
logger.list([
    {
        label: 'Type',
        value: os.type()
    },
    {
        label: 'Version',
        value: os.version()
    },
]);

await client.start();