const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'avaliacao',

    async execute(interaction) {
        const nota = interaction.customId.split('_')[1];

        const avaliacoesChannel = interaction.guild.channels.cache.find(channel =>
            channel.name.toLowerCase().includes('avalia')
        );

        if (avaliacoesChannel) {
            const embed = new EmbedBuilder()
                .setColor('#00b7ff')
                .setTitle('⭐ Nova Avaliação')
                .setDescription('Um atendimento foi avaliado por um cliente.')
                .addFields(
                    { name: '👤 Cliente', value: `${interaction.user}`, inline: true },
                    { name: '⭐ Nota', value: `${'⭐'.repeat(Number(nota))} (${nota}/5)`, inline: true },
                    { name: '🎫 Ticket', value: `#${interaction.channel.name}`, inline: false }
                )
                .setFooter({ text: 'Hopes Dev • Avaliações' })
                .setTimestamp();

            await avaliacoesChannel.send({ embeds: [embed] });
        }

        await interaction.reply({
            content: `✅ Obrigado pela avaliação! Nota enviada: ${'⭐'.repeat(Number(nota))}`,
            flags: 64
        });

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => {});
        }, 5000);
    }
};