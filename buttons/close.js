const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createTranscript } = require('../utils/transcript');

module.exports = {
    customId: 'fechar_ticket',

    async execute(interaction) {
        const logsChannel = interaction.guild.channels.cache.find(channel =>
            channel.name.toLowerCase().includes('logs')
        );

        const channelName = interaction.channel.name;
        const transcriptBuffer = await createTranscript(interaction.channel);

        const transcriptFile = new AttachmentBuilder(transcriptBuffer, {
            name: `transcript-${channelName}.txt`
        });

        if (logsChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#ff3b3b')
                .setTitle('🔒 Ticket Finalizado')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription('Um atendimento foi finalizado e o transcript foi gerado automaticamente.')
                .addFields(
                    {
                        name: '👤 Fechado por',
                        value: `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: '📂 Canal',
                        value: `#${channelName}`,
                        inline: true
                    },
                    {
                        name: '🔴 Status',
                        value: 'Finalizado',
                        inline: true
                    },
                    {
                        name: '📄 Transcript',
                        value: 'Arquivo anexado abaixo',
                        inline: true
                    },
                    {
                        name: '🕒 Horário',
                        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                        inline: false
                    }
                )
                .setFooter({
                    text: 'Hopes Core • Ticket Logs'
                })
                .setTimestamp();

            await logsChannel.send({
                embeds: [logEmbed],
                files: [transcriptFile]
            });
        }

        const closeEmbed = new EmbedBuilder()
            .setColor('#ff3b3b')
            .setTitle('🔒 Ticket sendo finalizado')
            .setDescription(
`📄 O transcript foi gerado com sucesso.

🔴 **Status:** Finalizado

Este canal será fechado automaticamente em **5 segundos**.`
            )
            .setFooter({
                text: 'Hopes Dev • Atendimento Encerrado'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [closeEmbed]
        });

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => {});
        }, 5000);
    }
};