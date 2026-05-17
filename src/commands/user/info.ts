import { Command, FastComponent, FastContainer } from '@/core'
import { ApplicationCommandOptionType, GuildMember, MessageFlags, PermissionFlagsBits, User } from 'discord.js'

import { UserService } from '@/database/services'
import { applicationEmojiHelperSync, getDominantColor, memberHelper, parseUserMention } from '@/utils'

const toDiscordTimestamp = (date?: number | Date | null) => {
    return date ? Math.floor(new Date(date).getTime() / 1000) : null;
}

const buildPayload = async (userOrMember: User | GuildMember) => {
    const {
        infoIconEmoji,
        identityEmoji,
        threadEmoji,
        leafEmoji,
        crownEmoji,
        diamondEmoji,
        userCheckEmoji,
        moderateEmoji,
        tagIconEmoji
    } = applicationEmojiHelperSync();

    const isMember = userOrMember instanceof GuildMember;

    const user = isMember ? userOrMember.user : userOrMember;
    const helper = isMember ? await memberHelper(userOrMember, { fetchAll: true }) : null;

    const avatarURL = (helper?.getAvatarURL ?? user.displayAvatarURL)({ size: 512 });
    const bannerURL = (helper?.getBannerURL ?? user.bannerURL)({ size: 1024 });
    const avatarDominantColor = await (helper?.getAvatarDominantColor() ?? getDominantColor(avatarURL));

    const isBot = user.bot;
    const userDatabase = isBot ? null : await UserService.findById(user.id);

    const hasGuildTag = isMember ? user.primaryGuild?.identityGuildId === userOrMember.guild.id : null;
    const createdAt = toDiscordTimestamp(user.createdTimestamp);
    const tagAssignedAt = toDiscordTimestamp(userDatabase?.tagAssignedAt);

    const components = [];

    if (bannerURL) {
        components.push(
            FastComponent.createMediaGallery([{ media: { url: bannerURL } }])
        );
    }

    const informations = [
        `### ${infoIconEmoji} Information sur l'${isBot ? "application" : "utilisateur"}`,
        `- ${identityEmoji} **Identifiant**`,
        `> **\`${user.id}\`**`,
        `- ${threadEmoji} **Nom d'utilisateur**`,
        `> **\`${user.username}\`**`,
        `- ${userCheckEmoji} **Compte créer depuis**`,
        `> <t:${createdAt}>`,
        `> <t:${createdAt}:R>`
    ];

    if (isMember && !isBot) {
        const joinedAt = toDiscordTimestamp(userOrMember.joinedTimestamp);
        const premiumSinceAt = toDiscordTimestamp(userOrMember.premiumSinceTimestamp);
        const isOwner = userOrMember.guild.ownerId === userOrMember.id;
        const canModerate = userOrMember.permissions.any(
            PermissionFlagsBits.Administrator
            | PermissionFlagsBits.KickMembers
            | PermissionFlagsBits.MuteMembers
            | PermissionFlagsBits.DeafenMembers
            | PermissionFlagsBits.ModerateMembers
        );

        const memberInfo = [
            `### ${infoIconEmoji} Information sur le membre`,
        ];

        if (isOwner) {
            memberInfo.push(`- ${crownEmoji} **Gérant de \`${userOrMember.guild.name}\`**`);
        } else if (canModerate) {
            memberInfo.push(`- ${moderateEmoji} **Modérateur de \`${userOrMember.guild.name}\`**`);
        }

        memberInfo.push(
            `- ${leafEmoji} **Membre de \`${userOrMember.guild.name}\` depuis**`,
            `> <t:${joinedAt}>`,
            `> <t:${joinedAt}:R>`
        );

        if (premiumSinceAt) {
            memberInfo.push(
                `- ${diamondEmoji} **Premier boost fait le**`,
                `> <t:${premiumSinceAt}>`,
                `> <t:${premiumSinceAt}:R>`
            );
        }

        if (tagAssignedAt && hasGuildTag) {
            memberInfo.push(
                `- ${tagIconEmoji} **Porte le tag du serveur depuis**`,
                `> <t:${tagAssignedAt}>`,
                `> <t:${tagAssignedAt}:R>`
            );
        }

        informations.push(...memberInfo);
    }

    const buttons = [
        FastComponent.createButton('Avatar', { url: avatarURL }),
    ];

    if (bannerURL) {
        buttons.push(
            FastComponent.createButton('Bannière', { url: bannerURL })
        );
    }

    components.push(
        FastComponent.createSection({
            accessory: FastComponent.createThumbnail({ url: avatarURL }),
            components: [
                FastComponent.createTextDisplay(`## ${user}`),
                FastComponent.createTextDisplay(informations.join('\n')),
            ]
        }),
        FastComponent.createSeparator(),
        FastComponent.createActionRow(buttons)
    );

    const container = FastContainer.create({
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
