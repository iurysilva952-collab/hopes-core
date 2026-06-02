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

        const tickets = history.tickets || 0;
        const ratings = history.ratings || 0;

        const lastTicket = history.lastTicket
            ? `<t:${Math.floor(history.lastTicket / 1000)}:F>`
            : 'Não registrado';

        const statusCliente = tickets >= 5
            ? '🟢 Cliente recorrente'
            : tickets >= 2
                ? '🟡 Cliente em acompanhamento'
                : '🔵 Novo cliente';

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('📋 Histórico do Cliente')
            .setThumbnail(cliente.displayAvatarURL())
            .setDescription(`Resumo de atendimento de ${cliente}.`)
            .addFields(
                {
                    name: '👤 Cliente',
                    value: `${cliente}\n\`${cliente.id}\``,
                    inline: false
                },
                {
                    name: '🎫 Tickets Abertos',
                    value: `${tickets}`,
                    inline: true
                },
                {
                    name: '⭐ Avaliações Feitas',
                    value: `${ratings}`,
                    inline: true
                },
                {
                    name: '📌 Status',
                    value: statusCliente,
                    inline: true
                },
                {
                    name: '🕒 Último Ticket',
                    value: lastTicket,
                    inline: false
                }
            )
            .setFooter({
                text: 'Hopes Core • Client History'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });
    }
};