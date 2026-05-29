const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {
    customId: 'add_user',

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('add_user_modal')
            .setTitle('Adicionar Usuário');

        const userIdInput = new TextInputBuilder()
            .setCustomId('user_id')
            .setLabel('ID do usuário')
            .setPlaceholder('Ex: 123456789012345678')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(userIdInput);

        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};