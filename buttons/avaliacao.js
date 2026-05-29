const {
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {
    customId: 'avaliacao',

    async execute(interaction) {
        const nota = interaction.customId.split('_')[1];

        const modal = new ModalBuilder()
            .setCustomId(`avaliacao_modal_${nota}`)
            .setTitle('Avaliação de Atendimento');

        const comentarioInput = new TextInputBuilder()
            .setCustomId('comentario')
            .setLabel('Como foi seu atendimento?')
            .setPlaceholder('Ex: Atendimento rápido e profissional.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(500);

        const row = new ActionRowBuilder().addComponents(comentarioInput);

        modal.addComponents(row);

        await interaction.showModal(modal);
    },

    async executeModal(interaction) {
        const nota = interaction.customId.split('_')[2];
        const estrelas = '⭐'.repeat(Number(nota));
        const comentario = interaction.fields.getTextInputValue('comentario') || 'Sem comentário.';

        const avaliacoesChannel = interaction.guild.channels.cache.find(channel =>
            channel.name === '⭐・avaliações' ||
            channel.name === '⭐・avaliaçoes' ||
            channel.name === 'avaliações' ||
            channel.name === 'avaliacoes'
        );

        if (!avaliacoesChannel) {
            return interaction.reply({
                content: '❌ Canal de avaliações não encontrado.',
                flags: 64
            });
        }

        let atendente = 'Não informado';

        if (interaction.channel.topic && interaction.channel.topic.includes('claimedBy=')) {
            const staffId = interaction.channel.topic.split('claimedBy=')[1].split(';')[0];
            atendente = `<@${staffId}>`;
        }

        const embed = new EmbedBuilder()
            .setColor('#00b7ff')
            .setTitle('🏆 Feedback Recebido')
            .setDescription(
`A Hopes Dev recebeu uma nova avaliação de atendimento.

━━━━━━━━━━━━━━━━━━`
            )
            .addFields(
                {
                    name: '⭐ Avaliação',
                    value: `${estrelas}\n**Nota:** ${nota}/5`,
                    inline: false
                },
                {
                    name: '👤 Cliente',
                    value: `${interaction.user}`,
                    inline: true
                },
                {
                    name: '🛠️ Atendente',
                    value: atendente,
                    inline: true
                },
                {
                    name: '💬 Comentário',
                    value: comentario,
                    inline: false
                },
                {
                    name: '🎫 Ticket',
                    value: `#${interaction.channel.name}`,
                    inline: false
                }
            )
            .setFooter({
                text: 'Hopes Dev • Feedback System'
            })
            .setTimestamp();

        await avaliacoesChannel.send({
            embeds: [embed]
        });

        await interaction.reply({
            content: `✅ Obrigado pela avaliação! Nota enviada: ${estrelas}`,
            flags: 64
        });

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => {});
        }, 5000);
    }
};