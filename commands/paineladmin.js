const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStats } = require('../utils/staffStats');
const { readBlacklist } = require('../utils/blacklist');
const config = require('../config/ticketConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('paineladmin')
        .setDescription('Mostra o painel administrativo do Hopes Core.'),

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

        const stats = getStats();
        const entries = Object.entries(stats);

        const totalTickets = entries.reduce((acc, [, data]) => acc + data.tickets, 0);
        const totalRating = entries.reduce((acc, [, data]) => acc + data.totalRating, 0);

        const mediaGeral = totalTickets > 0
            ? (totalRating / totalTickets).toFixed(1)
            : '0.0';

        const melhorAtendente = entries.length > 0
            ? entries
                .map(([staffId, data]) => ({
                    staffId,
                    tickets: data.tickets,
                    media: data.tickets > 0 ? data.totalRating / data.tickets : 0
                }))
                .sort((a, b) => {
                    if (b.media !== a.media) return b.media - a.media;
                    return b.tickets - a.tickets;
                })[0]
            : null;

        const blacklist = readBlacklist();

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('📈 Painel Administrativo — Hopes Core')
            .setDescription('Resumo geral do sistema de atendimento da Hopes Dev.')
            .addFields(
                {
                    name: '🎫 Tickets Avaliados',
                    value: `${totalTickets}`,
                    inline: true
                },
                {
                    name: '⭐ Média Geral',
                    value: `${mediaGeral}/5`,
                    inline: true
                },
                {
                    name: '👥 Atendentes Registrados',
                    value: `${entries.length}`,
                    inline: true
                },
                {
                    name: '🚫 Usuários na Blacklist',
                    value: `${blacklist.length}`,
                    inline: true
                },
                {
                    name: '🏆 Melhor Atendente',
                    value: melhorAtendente
                        ? `<@${melhorAtendente.staffId}>\n⭐ ${melhorAtendente.media.toFixed(1)}/5 • 🎫 ${melhorAtendente.tickets} tickets`
                        : 'Nenhum atendente registrado.',
                    inline: false
                }
            )
            .setFooter({
                text: 'Hopes Core • Admin Dashboard'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });
    }
};