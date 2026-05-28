const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const { isOnCooldown } = require('../utils/cooldowns');
const config = require('../config/ticketConfig');

module.exports = {
    customId: 'ticket_select',

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const cooldown = isOnCooldown(
            interaction.user.id,
            'ticket_create',
            config.cooldowns.ticketCreate
        );

        if (cooldown > 0) {
            return interaction.editReply({
                content: `⏳ Aguarde ${cooldown}s antes de tentar abrir outro ticket.`
            });
        }

        const selected = interaction.values[0];
        const tipos = config.categories;

        const guild = interaction.guild;
        const member = interaction.member;

        const safeUsername = interaction.user.username
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

        const staffRole = guild.roles.cache.find(role =>
            config.roles.staffKeywords.some(keyword =>
                role.name.toLowerCase().includes(keyword)
            )
        );

        const ticketsCategory = guild.channels.cache.find(channel =>
            channel.type === ChannelType.GuildCategory &&
            channel.name.toLowerCase().includes(config.channels.ticketsCategoryKeyword)
        );

        const logsChannel = guild.channels.cache.find(channel =>
            channel.name.toLowerCase().includes(config.channels.logsKeyword)
        );

        const existingTicket = guild.channels.cache.find(channel =>
            channel.name.includes(safeUsername)
        );

        if (existingTicket) {
            return interaction.editReply({
                content: `❌ Você já possui um ticket aberto: ${existingTicket}`
            });
        }

        const ticketChannel = await guild.channels.create({
            name: `${selected}-${safeUsername}`,
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
            .setColor(config.color)
            .setTitle('🎫 Ticket Aberto')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(
`Olá, ${interaction.user}!

Seu atendimento foi iniciado com sucesso.

Descreva abaixo sua solicitação e aguarde nossa equipe responder.`
            )
            .addFields(
                {
                    name: '📂 Categoria',
                    value: tipos[selected],
                    inline: true
                },
                {
                    name: '👤 Cliente',
                    value: `${interaction.user}`,
                    inline: true
                },
                {
                    name: '🟡 Status',
                    value: 'Aguardando Atendimento',
                    inline: true
                }
            )
            .setFooter({
                text: config.brand.footer
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
                .setColor(config.color)
                .setTitle('🎫 Ticket Criado')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription('Um novo atendimento foi aberto no sistema.')
                .addFields(
                    {
                        name: '👤 Cliente',
                        value: `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: '📂 Categoria',
                        value: tipos[selected],
                        inline: true
                    },
                    {
                        name: '🟡 Status',
                        value: 'Aguardando Atendimento',
                        inline: true
                    },
                    {
                        name: '📌 Canal',
                        value: `${ticketChannel}`,
                        inline: true
                    },
                    {
                        name: '🆔 ID do usuário',
                        value: interaction.user.id,
                        inline: true
                    },
                    {
                        name: '🕒 Horário',
                        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                        inline: false
                    }
                )
                .setFooter({
                    text: config.brand.logsFooter
                })
                .setTimestamp();

            await logsChannel.send({
                embeds: [logEmbed]
            });
        }

        return interaction.editReply({
            content: `✅ Seu ticket foi criado: ${ticketChannel}`
        });
    }
};