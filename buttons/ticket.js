const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    customId: 'ticket',

    async execute(interaction) {
        const guild = interaction.guild;
        const member = interaction.member;

        const staffRole = guild.roles.cache.find(role =>
            role.name.toLowerCase().includes('staff')
        );

        const ticketsCategory = guild.channels.cache.find(channel =>
            channel.type === ChannelType.GuildCategory &&
            channel.name.toLowerCase().includes('tickets')
        );

        const logsChannel = guild.channels.cache.find(channel =>
            channel.name.toLowerCase().includes('logs')
        );

        const existingTicket = guild.channels.cache.find(channel =>
            channel.name === `ticket-${interaction.user.username.toLowerCase()}`
        );

        if (existingTicket) {
            return interaction.reply({
                content: `❌ Você já possui um ticket aberto: ${existingTicket}`,
                flags: 64
            });
        }

        const ticketChannel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: ticketsCategory ? ticketsCategory.id : null,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: member.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                ...(staffRole ? [{
                    id: staffRole.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageChannels
                    ]
                }] : [])
            ]
        });

        const embed = new EmbedBuilder()
            .setColor('#00b7ff')
            .setTitle('🎫 Ticket Aberto')
            .setDescription(
`Olá, ${interaction.user}!

Seu ticket foi criado com sucesso.

Explique abaixo o motivo do seu atendimento para que nossa equipe possa te ajudar.

━━━━━━━━━━━━━━━━━━

💎 Hopes Dev • Premium Discord Solutions`
            )
            .setFooter({
                text: 'Hopes Dev • Atendimento Privado'
            })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('claim_ticket')
                .setLabel('Assumir Ticket')
                .setEmoji('👤')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('add_user')
                .setLabel('Add User')
                .setEmoji('➕')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('remove_user')
                .setLabel('Remove User')
                .setEmoji('➖')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId('fechar_ticket')
                .setLabel('Fechar Ticket')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({
            content: `${interaction.user}${staffRole ? ` | ${staffRole}` : ''}`,
            embeds: [embed],
            components: [row]
        });

        if (logsChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#00b7ff')
                .setTitle('🎫 Ticket Criado')
                .setDescription(
`Usuário: ${interaction.user}

Canal: ${ticketChannel}

Horário: <t:${Math.floor(Date.now() / 1000)}:F>`
                )
                .setFooter({
                    text: 'Hopes Core • Logs'
                })
                .setTimestamp();

            await logsChannel.send({
                embeds: [logEmbed]
            });
        }

        return interaction.reply({
            content: `✅ Seu ticket foi criado: ${ticketChannel}`,
            flags: 64
        });
    }
};