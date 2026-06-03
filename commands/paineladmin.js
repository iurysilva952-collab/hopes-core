const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getStats } = require('../utils/staffStats');
const { readBlacklist } = require('../utils/blacklist');
const { getSales } = require('../utils/sales');
const { getGoal } = require('../utils/meta');
const { getAllCoupons } = require('../utils/coupons');
const config = require('../config/ticketConfig');

function createProgressBar(percent) {
    const totalBlocks = 10;
    const filledBlocks = Math.round((Math.min(percent, 100) / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;

    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}

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

        const stats = getStats() || {};
        const entries = Object.entries(stats);

        const blacklist = readBlacklist() || [];
        const sales = getSales() || [];
        const coupons = getAllCoupons() || {};
        const goal = getGoal();

        const totalTickets = entries.reduce((acc, [, data]) => acc + (data.tickets || 0), 0);
        const totalRating = entries.reduce((acc, [, data]) => acc + (data.totalRating || 0), 0);

        const mediaGeral = totalTickets > 0
            ? (totalRating / totalTickets).toFixed(1)
            : '0.0';

        const melhorAtendente = entries.length > 0
            ? entries
                .map(([staffId, data]) => ({
                    staffId,
                    tickets: data.tickets || 0,
                    media: data.tickets > 0 ? data.totalRating / data.tickets : 0
                }))
                .sort((a, b) => {
                    if (b.media !== a.media) return b.media - a.media;
                    return b.tickets - a.tickets;
                })[0]
            : null;

        const totalVendido = sales.reduce((acc, sale) => acc + Number(sale.value || 0), 0);
        const totalPago = sales
            .filter(sale => sale.status === 'pago')
            .reduce((acc, sale) => acc + Number(sale.value || 0), 0);
        const totalPendente = sales
            .filter(sale => sale.status === 'pendente')
            .reduce((acc, sale) => acc + Number(sale.value || 0), 0);

        const metaPercent = goal > 0 ? (totalPago / goal) * 100 : 0;
        const metaBar = createProgressBar(metaPercent);

        const metaStatus = metaPercent >= 100
            ? '🟢 Meta atingida'
            : metaPercent >= 60
                ? '🟡 Em andamento'
                : '🔴 Abaixo da meta';

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('📈 Painel Administrativo — Hopes Core')
            .setDescription(
                'Resumo premium dos principais sistemas da **Hopes Dev**.\n' +
                'Use este painel para acompanhar atendimento, vendas e operação.'
            )
            .addFields(
                {
                    name: '🎫 Atendimento',
                    value:
                        `**Tickets avaliados:** ${totalTickets}\n` +
                        `**Média geral:** ${mediaGeral}/5\n` +
                        `**Atendentes registrados:** ${entries.length}`,
                    inline: false
                },
                {
                    name: '🏆 Melhor Atendente',
                    value: melhorAtendente && melhorAtendente.tickets > 0
                        ? `<@${melhorAtendente.staffId}>\n⭐ ${melhorAtendente.media.toFixed(1)}/5 • 🎫 ${melhorAtendente.tickets} tickets`
                        : 'Nenhum atendente registrado.',
                    inline: false
                },
                {
                    name: '💰 Financeiro',
                    value:
                        `**Vendas registradas:** ${sales.length}\n` +
                        `**Total vendido:** R$ ${totalVendido.toFixed(2)}\n` +
                        `**Pago:** R$ ${totalPago.toFixed(2)}\n` +
                        `**Pendente:** R$ ${totalPendente.toFixed(2)}`,
                    inline: false
                },
                {
                    name: '🎯 Meta Mensal',
                    value:
                        `**Meta:** R$ ${goal.toFixed(2)}\n` +
                        `**Progresso:** ${metaPercent.toFixed(1)}%\n` +
                        `\`${metaBar}\`\n` +
                        `**Status:** ${metaStatus}`,
                    inline: false
                },
                {
                    name: '🎁 Cupons',
                    value: `**Ativos:** ${Object.keys(coupons).length}`,
                    inline: true
                },
                {
                    name: '🚫 Blacklist',
                    value: `**Usuários:** ${blacklist.length}`,
                    inline: true
                },
                {
                    name: '⚙️ Sistema',
                    value:
                        '**Versão:** Hopes Core v1.1\n' +
                        '**Logs:** Separados\n' +
                        '**Backup:** Ativo\n' +
                        '**Transcript HTML:** Ativo',
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