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

        const stats = getStats() || {};
        const blacklist = readBlacklist() || [];
        const coupons = getAllCoupons() || {};
        const sales = getSales() || [];

        const statsEntries = Object.entries(stats);

        const totalTickets = statsEntries.reduce((acc, [, data]) => acc + (data.tickets || 0), 0);
        const totalRating = statsEntries.reduce((acc, [, data]) => acc + (data.totalRating || 0), 0);

        const mediaGeral = totalTickets > 0
            ? (totalRating / totalTickets).toFixed(1)
            : '0.0';

        const melhorStaff = statsEntries.length > 0
            ? statsEntries
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

        const paidSalesList = sales.filter(sale => sale.status === 'pago');
        const pendingSalesList = sales.filter(sale => sale.status === 'pendente');

        const totalSales = sales.reduce((acc, sale) => acc + Number(sale.value || 0), 0);
        const paidSales = paidSalesList.reduce((acc, sale) => acc + Number(sale.value || 0), 0);
        const pendingSales = pendingSalesList.reduce((acc, sale) => acc + Number(sale.value || 0), 0);

        const ticketStatus = totalTickets > 0
            ? '🟢 Sistema ativo'
            : '🟡 Aguardando avaliações';

        const salesStatus = sales.length > 0
            ? '🟢 Vendas registradas'
            : '🟡 Nenhuma venda registrada';

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('📊 Hopes Core Dashboard')
            .setDescription(
                'Painel geral de controle da **Hopes Dev**.\n' +
                'Aqui estão os principais dados do bot e da operação.'
            )
            .addFields(
                {
                    name: '🎫 Atendimento',
                    value:
                        `**Tickets avaliados:** ${totalTickets}\n` +
                        `**Média geral:** ${mediaGeral}/5\n` +
                        `**Status:** ${ticketStatus}`,
                    inline: false
                },
                {
                    name: '👥 Equipe',
                    value:
                        `**Staff registrado:** ${statsEntries.length}\n` +
                        `**Melhor staff:** ${
                            melhorStaff && melhorStaff.tickets > 0
                                ? `<@${melhorStaff.staffId}> — ⭐ ${melhorStaff.media.toFixed(1)}/5 • 🎫 ${melhorStaff.tickets} tickets`
                                : 'Nenhum staff registrado ainda.'
                        }`,
                    inline: false
                },
                {
                    name: '💰 Financeiro',
                    value:
                        `**Total vendido:** R$ ${totalSales.toFixed(2)}\n` +
                        `**Pago:** R$ ${paidSales.toFixed(2)}\n` +
                        `**Pendente:** R$ ${pendingSales.toFixed(2)}\n` +
                        `**Vendas registradas:** ${sales.length}\n` +
                        `**Status:** ${salesStatus}`,
                    inline: false
                },
                {
                    name: '🎁 Cupons',
                    value: `**Cupons ativos:** ${Object.keys(coupons).length}`,
                    inline: true
                },
                {
                    name: '🚫 Blacklist',
                    value: `**Usuários bloqueados:** ${blacklist.length}`,
                    inline: true
                },
                {
                    name: '⚙️ Sistema',
                    value: '**Versão:** Hopes Core v1.0\n**Hospedagem:** Railway\n**Status:** Online',
                    inline: false
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