const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const { isOnCooldown } = require('../utils/cooldowns');
const { isBlacklisted } = require('../utils/blacklist');
const { registerTicket } = require('../utils/clientHistory');
const config = require('../config/ticketConfig');

module.exports = {
    customId: 'ticket_select',

    async execute(interaction) {
        const selected = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`ticket_form_${selected}`)
            .setTitle('Formulário de Atendimento');

        const servicoInput = new TextInputBuilder()
            .setCustomId('servico')
            .setLabel('Qual serviço você deseja?')
            .setPlaceholder('Ex: Bot Discord, setup de servidor, design...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const orcamentoInput = new TextInputBuilder()
            .setCustomId('orcamento')
            .setLabel('Qual seu orçamento disponível?')
            .setPlaceholder('Ex: R$ 300,00')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descricaoInput = new TextInputBuilder()
            .setCustomId('descricao')
            .setLabel('Explique seu projeto ou dúvida')
            .setPlaceholder('Descreva com detalhes o que você precisa.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(servicoInput),
            new ActionRowBuilder().addComponents(orcamentoInput),
            new ActionRowBuilder().addComponents(descricaoInput)
        );

        await interaction.showModal(modal);
    },

    async executeModal(interaction) {
        await interaction.deferReply({ flags: 64 });

        if (isBlacklisted(interaction.user.id)) {
            return interaction.editReply({
                content: '🚫 Você está bloqueado de abrir tickets neste servidor.'
            });
        }

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

        const selected = interaction.customId.replace('ticket_form_', '');
        const tipos = config.categories;

        const servico = interaction.fields.getTextInputValue('servico');
        const orcamento = interaction.fields.getTextInputValue('orcamento');
        const descricao = interaction.fields.getTextInputValue('descricao');

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

        registerTicket(interaction.user.id);

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

Nossa equipe já recebeu as informações do seu formulário.`
            )
            .addFields(
                { name: '📂 Categoria', value: tipos[selected], inline: true },
                { name: '👤 Cliente', value: `${interaction.user}`, inline: true },
                { name: '🟡 Status', value: 'Aguardando Atendimento', inline: true },
                { name: '🛠️ Serviço Desejado', value: servico, inline: false },
                { name: '💰 Orçamento Disponível', value: orcamento, inline: false },
                { name: '📝 Descrição do Projeto', value: descricao, inline: false }
            )
            .setFooter({ text: config.brand.footer })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('claim_ticket').setLabel('Assumir Ticket').setEmoji('👤').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('add_user').setLabel('Add User').setEmoji('➕').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('remove_user').setLabel('Remove User').setEmoji('➖').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('fechar_ticket').setLabel('Fechar Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger)
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
                .setDescription('Um novo atendimento foi aberto com formulário.')
                .addFields(
                    { name: '👤 Cliente', value: `${interaction.user}`, inline: true },
                    { name: '📂 Categoria', value: tipos[selected], inline: true },
                    { name: '📌 Canal', value: `${ticketChannel}`, inline: true },
                    { name: '🛠️ Serviço', value: servico, inline: false },
                    { name: '💰 Orçamento', value: orcamento, inline: false },
                    { name: '🕒 Horário', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setFooter({ text: config.brand.logsFooter })
                .setTimestamp();

            await logsChannel.send({ embeds: [logEmbed] });
        }

        return interaction.editReply({
            content: `✅ Seu ticket foi criado: ${ticketChannel}`
        });
    }
};