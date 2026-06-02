const {
    EmbedBuilder,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const { createTranscript } = require('../utils/transcript');
const { generateTranscriptHTML } = require('../utils/transcriptHTML');

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

        const transcriptHTMLPath = await generateTranscriptHTML(interaction.channel);

        const transcriptHTMLFile = new AttachmentBuilder(transcriptHTMLPath, {
            name: `transcript-${channelName}.html`
        });

        if (logsChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#ff3b3b')
                .setTitle('🔒 Ticket Finalizado')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription('Um atendimento foi finalizado e os transcripts foram gerados automaticamente.')
                .addFields(
                    { name: '👤 Fechado por', value: `${interaction.user}`, inline: true },
                    { name: '📂 Canal', value: `#${channelName}`, inline: true },
                    { name: '🔴 Status', value: 'Finalizado', inline: true },
                    { name: '📄 Transcript TXT', value: 'Arquivo .txt anexado', inline: true },
                    { name: '🌐 Transcript HTML', value: 'Arquivo .html anexado', inline: true },
                    { name: '🕒 Horário', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setFooter({ text: 'Hopes Core • Ticket Logs' })
                .setTimestamp();

            await logsChannel.send({
                embeds: [logEmbed],
                files: [transcriptFile, transcriptHTMLFile]
            });
        }

        const closeEmbed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('⭐ Avaliação de Atendimento')
            .setDescription(
`Seu ticket foi finalizado.

Antes de encerrar o atendimento, avalie nosso serviço:`
            )
            .setFooter({ text: 'Hopes Dev • Avaliação' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('avaliacao_1').setLabel('⭐').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('avaliacao_2').setLabel('⭐⭐').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('avaliacao_3').setLabel('⭐⭐⭐').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('avaliacao_4').setLabel('⭐⭐⭐⭐').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('avaliacao_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Success)
        );

        await interaction.reply({
            embeds: [closeEmbed],
            components: [row]
        });
    }
};