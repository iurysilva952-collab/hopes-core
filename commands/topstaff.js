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

        const stats = getStats();
        const entries = Object.entries(stats);

        if (entries.length === 0) {
            return interaction.reply({
                content: '🏆 Ainda não existem dados para o ranking.',
                flags: 64
            });
        }

        const ranking = entries
            .map(([staffId, data]) => {
                const media = data.tickets > 0
                    ? Number(data.totalRating / data.tickets)
                    : 0;

                return {
                    staffId,
                    tickets: data.tickets,
                    media
                };
            })
            .sort((a, b) => {
                if (b.media !== a.media) return b.media - a.media;
                return b.tickets - a.tickets;
            })
            .slice(0, 10);

        const medals = ['🥇', '🥈', '🥉'];

        const description = ranking
            .map((staff, index) => {
                const medal = medals[index] || `#${index + 1}`;

                return `${medal} **<@${staff.staffId}>**
🎫 Tickets avaliados: **${staff.tickets}**
⭐ Média: **${staff.media.toFixed(1)}/5**`;
            })
            .join('\n\n');

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('🏆 Ranking da Equipe')
            .setDescription(description)
            .setFooter({
                text: 'Hopes Core • Staff Ranking'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};