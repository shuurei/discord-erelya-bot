import { Command, FastComponent, FastContainer } from '@/core'
import { ChannelType, Guild, GuildPremiumTier, MessageFlags } from 'discord.js'
import { applicationEmojiHelperSync, escapeAllMarkdown, getDominantColor } from '@/utils'

const formatPremiumTier = (tier: GuildPremiumTier) => {
    return tier === 3 ? 'Nv. **MAX**' : tier === 0 ? 'Aucun niveau' : `Nv. **${tier}**`;
}

const buildPayload = async (guild: Guild) => {
    const {
        infoIconEmoji,
        crownEmoji,
        diamondEmoji,
        identityEmoji,
        clockIconEmoji
    } = applicationEmojiHelperSync();

    const allMembers = guild.members.cache;
    const memberCounts = {
        total: allMembers.size,
        members: 0,
        bots: 0,
        online: 0,
        dnd: 0,
        idle: 0
    };

    allMembers.forEach(({ user, presence }) => {
        if (user.bot) memberCounts.bots++;
        else memberCounts.members++;

        switch (presence?.status) {
            case 'online': memberCounts.online++; break;
            case 'dnd': memberCounts.dnd++; break;
            case 'idle': memberCounts.idle++; break;
        }
    });

    const channels = guild.channels.cache;
    const channelCounts = {
        total: channels.size,
        text: 0,
        voice: 0,
        stage: 0,
        category: 0
    };

    channels.forEach(({ type }) => {
        switch (type) {
            case ChannelType.GuildText: channelCounts.text++; break;
            case ChannelType.GuildVoice: channelCounts.voice++; break;
            case ChannelType.GuildStageVoice: channelCounts.stage++; break;
            case ChannelType.GuildCategory: channelCounts.category++; break;
        }
    });

    const components = [];

    const iconURL = guild.iconURL({ size: 512 });
    const bannerURL = guild.bannerURL({ size: 1024 });
    const iconDominantColor = iconURL ? await getDominantColor(iconURL, { hex: true }) : undefined;
    const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);

    const informations = [
        `## ${escapeAllMarkdown(guild.name)}`,
    ];

    if (guild.description) {
        informations.push(`> ${guild.description}`);
    };

    informations.push(
        `### ${infoIconEmoji} Information général`,
        `- ${identityEmoji} **Identifiant**`,
        `> **\`${guild.id}\`**`,
        `- ${crownEmoji} **Propriétaire**`,
        `> <@${guild.ownerId}> **||\`${guild.ownerId}\`||**`,
        `- ${diamondEmoji} **Niveau de boost**`,
        `> ${formatPremiumTier(guild.premiumTier)} / **\`${guild.premiumSubscriptionCount} boosts\`**`,
        `- ${clockIconEmoji} **Création du serveur**`,
        `> <t:${createdTimestamp}>`,
        `> <t:${createdTimestamp}:R>`,
    );

    if (bannerURL) {
        components.push(
            FastComponent.createMediaGallery([{
                media: { url: bannerURL }
            }])
        );
    }

    const informationComponent = FastComponent.createTextDisplay(informations.join('\n'));
    if (iconURL) {
        components.push(FastComponent.createSection({
            accessory: FastComponent.createThumbnail({ url: iconURL }),
            components: [informationComponent]
        }));
    } else {
        components.push(informationComponent);
    }

    components.push(FastComponent.createTextDisplay([
        `### ${infoIconEmoji} Information sur les salons`,
        `> - **\`${channelCounts.text}\`** salons textuels`,
        `> - **\`${channelCounts.voice}\`** salons vocaux`,
        `> - **\`${channelCounts.category}\`** catégories`,
        `> - **\`${channelCounts.stage}\`** salons de conférences`,
    ].join('\n')));

    components.push(FastComponent.createTextDisplay([
        `### ${infoIconEmoji} Information sur les membres`,
        `> - **\`${memberCounts.total}\`** membres totaux`,
        `> - **\`${memberCounts.members}\`** membres`,
        `> - **\`${memberCounts.bots}\`** bots`,
        `> - **\`${memberCounts.online}\`** en ligne`,
        `> - **\`${memberCounts.dnd}\`** en ne pas déranger`,
        `> - **\`${memberCounts.idle}\`** en inactivité`,
    ].join('\n')));


    const buttons = [];

    if (iconURL) {
        buttons.push(
            FastComponent.createButton('Icon', { url: iconURL })
        );
    }

    if (bannerURL) {
        buttons.push(
            FastComponent.createButton('Bannière', { url: bannerURL })
        );
    }

    if (buttons.length > 0) {
        components.push(
            FastComponent.createSeparator(),
            FastComponent.createActionRow(buttons)
        );
    }

    const container = FastContainer.create({
        color: iconDominantColor,
        components
    });

    return {
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: {},
        components: [container]
    } as const;
}

export default new Command({
    description: "📋 Retrieves a guild's information",
    descriptionLocalizations: {
        fr: "📋 Récupère les informations du serveur"
    },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return interaction.editReply(await buildPayload(interaction.guild));
    },
    async onMessage(message) {
        return await message.reply(await buildPayload(message.guild));
    }
});
