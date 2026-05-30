const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getClientHistory } = require('../utils/clientHistory');
const config = require('../config/ticketConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('historico')
        .setDescription('Mostra o histórico de atendimento de um cliente.')
        .addUserOption(option =>
            option
                .setName('cliente')
                .setDescription('Cliente que deseja consultar.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const member = interaction.member;

        const isStaff = member.roles.cache.some(role =>
            config.roles.staffKeywords.some(keyword =>
                role.name.toLowerCase().includes(keyword)
            )
        );

        if (!isStaff) {
            return interaction.reply({
                content: '❌ Você não tem permissão para usar este comando.',
                flags: 64
            });
        }

        const cliente = interaction.options.getUser('cliente');
        const history = getClientHistory(cliente.id);

        if (!history) {
            return interaction.reply({
                content: '📭 Este cliente ainda não possui histórico registrado.',
                flags: 64
            });
        }

        const lastTicket = history.lastTicket
            ? `<t:${Math.floor(history.lastTicket / 1000)}:F>`
            : 'Não registrado';

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('📋 Histórico do Cliente')
            .setThumbnail(cliente.displayAvatarURL())
            .addFields(
                { name: '👤 Cliente', value: `${cliente}`, inline: true },
                { name: '🎫 Tickets Abertos', value: `${history.tickets}`, inline: true },
                { name: '⭐ Avaliações Feitas', value: `${history.ratings}`, inline: true },
                { name: '🕒 Último Ticket', value: lastTicket, inline: false }
            )
            .setFooter({ text: 'Hopes Core • Client History' })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });
    }
};