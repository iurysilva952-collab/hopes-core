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
                role.name.toLowerCase().includes(keyword))
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
                content: '📊 Ainda não existem estatísticas registradas.',
                flags: 64
            });
        }

        const description = entries
            .map(([staffId, data], index) => {
                const media = data.tickets > 0
                    ? (data.totalRating / data.tickets).toFixed(1)
                    : '0.0';

                return `**${index + 1}. <@${staffId}>**\n🎫 Tickets avaliados: ${data.tickets}\n⭐ Média: ${media}/5`;
            })
            .join('\n\n');

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('📊 Estatísticas da Equipe')
            .setDescription(description)
            .setFooter({
                text: 'Hopes Core • Staff Stats'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};