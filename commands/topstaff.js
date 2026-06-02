const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStats } = require('../utils/staffStats');
const config = require('../config/ticketConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topstaff')
        .setDescription('Mostra o ranking dos atendentes.'),

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

        if (entries.length === 0) {
            return interaction.reply({
                content: '🏆 Ainda não existem dados para o ranking.',
                flags: 64
            });
        }

        const ranking = entries
            .map(([staffId, data]) => {
                const tickets = data.tickets || 0;
                const totalRating = data.totalRating || 0;

                const media = tickets > 0
                    ? Number(totalRating / tickets)
                    : 0;

                return {
                    staffId,
                    tickets,
                    media
                };
            })
            .filter(staff => staff.tickets > 0)
            .sort((a, b) => {
                if (b.media !== a.media) return b.media - a.media;
                return b.tickets - a.tickets;
            })
            .slice(0, 10);

        if (ranking.length === 0) {
            return interaction.reply({
                content: '🏆 Ainda não existem atendentes avaliados no ranking.',
                flags: 64
            });
        }

        const medals = ['🥇', '🥈', '🥉'];

        const description = ranking
            .map((staff, index) => {
                const position = medals[index] || `#${index + 1}`;

                return `${position} **<@${staff.staffId}>**\n` +
                    `🎫 Tickets avaliados: **${staff.tickets}**\n` +
                    `⭐ Média: **${staff.media.toFixed(1)}/5**`;
            })
            .join('\n\n');

        const bestStaff = ranking[0];

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('🏆 Ranking da Equipe')
            .setDescription(description)
            .addFields(
                {
                    name: '👑 Destaque atual',
                    value: `<@${bestStaff.staffId}> com **${bestStaff.media.toFixed(1)}/5** em **${bestStaff.tickets}** tickets avaliados.`,
                    inline: false
                }
            )
            .setFooter({
                text: 'Hopes Core • Staff Ranking'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });
    }
};