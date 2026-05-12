import { Command } from '@/core/command'
import { ApplicationCommandOptionType, GuildMember, MessageFlags } from 'discord.js'

import { ContainerUI } from '@/ui'
import {
    createMediaGallery,
    createSection,
    createSeparator,
    createTextDisplay,
    createThumbnail
} from '@/ui/components/common'

import { UserEntityFlags } from '@/database/utils'
import { UserService } from '@/database/services/User'

import { guildMemberHelper } from '@/helpers'
import { getDominantColor, parseUserMention } from '@/utils'

const toDiscordTimestamp = (date?: number | Date | null) => {
    return date ? Math.floor(new Date(date).getTime() / 1000) : null;
}

const buildPayload = async (member: GuildMember) => {
    const helper = await guildMemberHelper(member, { fetchAll: true });

    const isBot = member.user.bot;
    const hasGuildTag = member.user.primaryGuild?.identityGuildId === member.guild.id;

    const avatar = helper.getAvatarURL();
    const avatarDominantColor = await getDominantColor(avatar);
    const banner = helper.getBannerURL({ size: 1024 });

    const dbUser = isBot ? null : await UserService.findById(member.user.id);

    const createdAt = toDiscordTimestamp(member.user.createdTimestamp);
    const joinedAt = toDiscordTimestamp(member.joinedTimestamp);
    const premiumSinceAt = toDiscordTimestamp(member.premiumSinceTimestamp);
    const tagAssignedAt = toDiscordTimestamp(dbUser?.tagAssignedAt);

    const components = [];

    const infoLines = [
        `**Identifiant**`,
        `- **\`${member.id}\`**`,
        `**Nom d'utilisateur**`,
        `- **\`${member.user.username}\`**`,
    ];

    if (banner) {
        components.push(
            createMediaGallery([{ media: { url: banner } }])
        );
    }

    if (tagAssignedAt && hasGuildTag) {
        infoLines.push(
            `**Porte le tag du serveur depuis**`,
            `- <t:${tagAssignedAt}>`,
            `- <t:${tagAssignedAt}:R>`
        );
    }

    if (premiumSinceAt) {
        infoLines.push(
            `**Booster du serveur depuis**`,
            `- <t:${premiumSinceAt}>`,
            `- <t:${premiumSinceAt}:R>`
        );
    }

    infoLines.push(
        `**Membre depuis**`,
        `- <t:${joinedAt}>`,
        `- <t:${joinedAt}:R>`,
        `**Création du compte**`,
        `- <t:${createdAt}>`,
        `- <t:${createdAt}:R>`
    );

    components.push(
        createSection({
            accessory: createThumbnail({ url: avatar }),
            components: [
                createTextDisplay(`## ${member}`),
                createTextDisplay(infoLines.join('\n'))
            ]
        })
    );

    if (
        isBot ||
        dbUser?.flagsBitField?.any([
            UserEntityFlags.DEVELOPER,
            UserEntityFlags.CLEANER,
            UserEntityFlags.BETA
        ])
    ) {
        components.push(createSeparator());

        const titles = []

        if (isBot) {
            titles.push('un **Robot**');
        } else {
            if (dbUser?.flagsBitField.has(UserEntityFlags.DEVELOPER)) {
                titles.push('**Développeur**');
            } else if (dbUser?.flagsBitField.has(UserEntityFlags.BETA)) {
                titles.push('**Bêta-Tester**');
            }
            
            if (dbUser?.flagsBitField.has(UserEntityFlags.CLEANER)) {
                titles.push('**Nettoyeur**');
            }
        }

        components.push(
            createTextDisplay(`-# *Cet utilisateur est ${titles.join(' / ')}*`)
        )
    }

    const container = ContainerUI.create({
        color: avatarDominantColor,
        components
    });

    return {
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {},
        components: [container]
    } as const;
}

export default new Command({
    description: "😀 Retrieves a user's informations",
    descriptionLocalizations: {
        fr: "😀 Récupère les informations d'un utilisateur"
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'member',
                name_localizations: {
                    fr: 'membre'
                },
                description_localizations: {
                    fr: 'membre'
                }
            }
        ]
    },
    async onInteraction(interaction) {
        await interaction.deferReply();

        const member = interaction.options.getMember('member') ?? interaction.member;

        return await interaction.editReply(await buildPayload(member));
    },
    async onMessage(message, { args: [userId] }) {
        const member = userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member;

        if (member) {
            return await message.reply(await buildPayload(member));
        }
    }
});
