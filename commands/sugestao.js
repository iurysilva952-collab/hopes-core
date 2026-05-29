const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config/ticketConfig');

const suggestionsPath = path.join(__dirname, '..', 'database', 'suggestions.json');

function readSuggestions() {
    if (!fs.existsSync(suggestionsPath)) {
        fs.writeFileSync(suggestionsPath, JSON.stringify({}, null, 4));
    }

    return JSON.parse(fs.readFileSync(suggestionsPath, 'utf8') || '{}');
}

function saveSuggestions(data) {
    fs.writeFileSync(suggestionsPath, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugestao')
        .setDescription('Envia uma sugestão para o servidor.')
        .addStringOption(option =>
            option
                .setName('texto')
                .setDescription('Escreva sua sugestão.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const texto = interaction.options.getString('texto');

        const sugestoesChannel = interaction.guild.channels.cache.find(channel =>
            channel.name === '💡・sugestoes' ||
            channel.name === '💡・sugestões' ||
            channel.name === 'sugestoes' ||
            channel.name === 'sugestões'
        );

        if (!sugestoesChannel) {
            return interaction.reply({
                content: '❌ Canal de sugestões não encontrado.',
                flags: 64
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('💡 Nova Sugestão')
            .setDescription(texto)
            .addFields(
                { name: '👤 Autor', value: `${interaction.user}`, inline: true },
                { name: '👍 Aprovações', value: '0', inline: true },
                { name: '👎 Reprovações', value: '0', inline: true }
            )
            .setFooter({
                text: 'Hopes Dev • Sistema de Sugestões'
            })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('sugestao_up')
                .setLabel('Aprovar')
                .setEmoji('👍')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('sugestao_down')
                .setLabel('Reprovar')
                .setEmoji('👎')
                .setStyle(ButtonStyle.Danger)
        );

        const message = await sugestoesChannel.send({
            embeds: [embed],
            components: [row]
        });

        const suggestions = readSuggestions();

        suggestions[message.id] = {
            authorId: interaction.user.id,
            text: texto,
            upvotes: [],
            downvotes: []
        };

        saveSuggestions(suggestions);

        await interaction.reply({
            content: `✅ Sua sugestão foi enviada em ${sugestoesChannel}.`,
            flags: 64
        });
    }
};