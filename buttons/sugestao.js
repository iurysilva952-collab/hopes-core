const { EmbedBuilder } = require('discord.js');
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
    customId: 'sugestao',

    async execute(interaction) {
        const action = interaction.customId.split('_')[1];
        const messageId = interaction.message.id;

        const suggestions = readSuggestions();
        const suggestion = suggestions[messageId];

        if (!suggestion) {
            return interaction.reply({
                content: '❌ Sugestão não encontrada no banco de dados.',
                flags: 64
            });
        }

        suggestion.upvotes = suggestion.upvotes.filter(id => id !== interaction.user.id);
        suggestion.downvotes = suggestion.downvotes.filter(id => id !== interaction.user.id);

        if (action === 'up') {
            suggestion.upvotes.push(interaction.user.id);
        }

        if (action === 'down') {
            suggestion.downvotes.push(interaction.user.id);
        }

        saveSuggestions(suggestions);

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('💡 Nova Sugestão')
            .setDescription(suggestion.text)
            .addFields(
                { name: '👤 Autor', value: `<@${suggestion.authorId}>`, inline: true },
                { name: '👍 Aprovações', value: `${suggestion.upvotes.length}`, inline: true },
                { name: '👎 Reprovações', value: `${suggestion.downvotes.length}`, inline: true }
            )
            .setFooter({
                text: 'Hopes Dev • Sistema de Sugestões'
            })
            .setTimestamp();

        await interaction.message.edit({
            embeds: [embed]
        });

        await interaction.reply({
            content: '✅ Seu voto foi registrado.',
            flags: 64
        });
    }
};