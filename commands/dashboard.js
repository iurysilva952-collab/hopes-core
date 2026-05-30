const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getStats } = require('../utils/staffStats');
const { readBlacklist } = require('../utils/blacklist');
const { getAllCoupons } = require('../utils/coupons');
const { getSales } = require('../utils/sales');
const config = require('../config/ticketConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Mostra o dashboard geral do Hopes Core.'),

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
        const blacklist = readBlacklist();
        const coupons = getAllCoupons();
        const sales = getSales();

        const statsEntries = Object.entries(stats);

        const totalTickets = statsEntries.reduce((acc, [, data]) => acc + data.tickets, 0);
        const totalRating = statsEntries.reduce((acc, [, data]) => acc + data.totalRating, 0);

        const mediaGeral = totalTickets > 0
            ? (totalRating / totalTickets).toFixed(1)
            : '0.0';

        const melhorStaff = statsEntries.length > 0
            ? statsEntries
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

        const totalSales = sales.reduce((acc, sale) => acc + sale.value, 0);
        const paidSales = sales
            .filter(sale => sale.status === 'pago')
            .reduce((acc, sale) => acc + sale.value, 0);
        const pendingSales = sales
            .filter(sale => sale.status === 'pendente')
            .reduce((acc, sale) => acc + sale.value, 0);

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('📊 Hopes Core Dashboard')
            .setDescription('Resumo geral dos principais sistemas da Hopes Dev.')
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
                    name: '👥 Staff Registrado',
                    value: `${statsEntries.length}`,
                    inline: true
                },
                {
                    name: '🏆 Melhor Staff',
                    value: melhorStaff
                        ? `<@${melhorStaff.staffId}>\n⭐ ${melhorStaff.media.toFixed(1)}/5 • 🎫 ${melhorStaff.tickets} tickets`
                        : 'Nenhum staff registrado.',
                    inline: false
                },
                {
                    name: '💰 Total Vendido',
                    value: `R$ ${totalSales.toFixed(2)}`,
                    inline: true
                },
                {
                    name: '✅ Pago',
                    value: `R$ ${paidSales.toFixed(2)}`,
                    inline: true
                },
                {
                    name: '⏳ Pendente',
                    value: `R$ ${pendingSales.toFixed(2)}`,
                    inline: true
                },
                {
                    name: '🧾 Vendas Registradas',
                    value: `${sales.length}`,
                    inline: true
                },
                {
                    name: '🚫 Blacklist',
                    value: `${blacklist.length} usuários`,
                    inline: true
                },
                {
                    name: '🎁 Cupons Ativos',
                    value: `${Object.keys(coupons).length}`,
                    inline: true
                }
            )
            .setFooter({
                text: 'Hopes Core • General Dashboard'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });
    }
};