const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStats } = require('../utils/staffStats');
const config = require('../config/ticketConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Mostra estatísticas de atendimento da equipe.'),

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
                content: '📊 Ainda não existem estatísticas registradas.',
                flags: 64
            });
        }

        const sortedEntries = entries.sort(([, a], [, b]) => {
            const mediaA = a.tickets > 0 ? a.totalRating / a.tickets : 0;
            const mediaB = b.tickets > 0 ? b.totalRating / b.tickets : 0;

            if (mediaB !== mediaA) return mediaB - mediaA;
            return (b.tickets || 0) - (a.tickets || 0);
        });

        const totalTickets = sortedEntries.reduce((acc, [, data]) => acc + (data.tickets || 0), 0);
        const totalRating = sortedEntries.reduce((acc, [, data]) => acc + (data.totalRating || 0), 0);

        const mediaGeral = totalTickets > 0
            ? (totalRating / totalTickets).toFixed(1)
            : '0.0';

        const description = sortedEntries
            .map(([staffId, data], index) => {
                const tickets = data.tickets || 0;
                const totalRatingStaff = data.totalRating || 0;

                const media = tickets > 0
                    ? (totalRatingStaff / tickets).toFixed(1)
                    : '0.0';

                let medal = '🔹';

                if (index === 0) medal = '🥇';
                if (index === 1) medal = '🥈';
                if (index === 2) medal = '🥉';

                return `${medal} **${index + 1}. <@${staffId}>**\n` +
                    `🎫 Tickets avaliados: **${tickets}**\n` +
                    `⭐ Média: **${media}/5**`;
            })
            .join('\n\n');

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('📊 Estatísticas da Equipe')
            .setDescription(description)
            .addFields(
                {
                    name: '📌 Resumo Geral',
                    value:
                        `**Tickets avaliados:** ${totalTickets}\n` +
                        `**Média geral:** ${mediaGeral}/5\n` +
                        `**Staff registrados:** ${sortedEntries.length}`,
                    inline: false
                }
            )
            .setFooter({
                text: 'Hopes Core • Staff Stats'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64
        });
    }
};