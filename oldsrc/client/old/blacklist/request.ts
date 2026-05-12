// import { Command } from '@/core/command'
// import { ApplicationCommandOptionType } from 'discord.js'

// import { blacklistService } from '@/database/services'
// import { createNotifCard } from '@/ui/assets/cards/notifCard'

// export default new Command({
//     description: `📝 Submit a blacklist request`,
//     descriptionLocalizations: {
//         fr: `📝 Soumettre une demande de blacklist`
//     },
//     access: {
//         user: {
//             requiredPermissions: ['BanMembers']
//         }
//     },
//     slashCommand: {
//         arguments: [
//             {
//                 type: ApplicationCommandOptionType.User,
//                 name: 'user',
//                 description: 'user to blacklist',
//                 name_localizations: {
//                     fr: 'utilisateur'
//                 },
//                 description_localizations: {
//                     fr: 'utilisateur à mettre sur liste noire'
//                 },
//                 required: true
//             },
//             {
//                 type: ApplicationCommandOptionType.String,
//                 name: 'reason',
//                 description: 'reason of blacklist',
//                 name_localizations: {
//                     fr: 'raison'
//                 },
//                 description_localizations: {
//                     fr: 'raison de la mise en liste noire'
//                 }
//             },
//             {
//                 type: ApplicationCommandOptionType.String,
//                 name: 'context',
//                 description: 'context of blacklist',
//                 name_localizations: {
//                     fr: 'contexte'
//                 },
//                 description_localizations: {
//                     fr: 'contexte de la mise en liste noire'
//                 }
//             },
//         ]
//     },
//     async onInteraction(interaction) {
//         const target = interaction.options.getUser('user', true)

//         let blacklist = await blacklistService.findById(target.id);
//         if (blacklist) {
//             return await interaction.reply({
//                 files: [{
//                     attachment: await createNotifCard({
//                         text: `[Utilisateur déjà présent sur la liste noire.]`,
//                         theme: 'red'
//                     })
//                 }]
//             });
//         }

//         const author = interaction.user;
//         const reason = interaction.options.getString('reason');
//         const context = interaction.options.getString('context');

//         blacklist = await blacklistService.add({
//             targetId: target.id,
//             authorId: author.id,
//             guildId: interaction.guild.id,
//             reason,
//             context
//         });

//         this.client.emit('blacklistCreate', blacklist, interaction.guild, target, author);

//         return await interaction.reply({
//             files: [{
//                 attachment: await createNotifCard({
//                     text: `[Requête enregistrée. Traitement par un nettoyeur autorisé.]`,
//                     theme: 'green',
//                     fontSize: 22
//                 })
//             }]
//         });
//     }
// })