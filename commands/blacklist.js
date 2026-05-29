const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const { addBlacklist } = require('../utils/blacklist');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Adiciona um usuário à blacklist.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que será bloqueado.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');

        addBlacklist(user.id);

        await interaction.reply({
            content: `🚫 ${user} foi adicionado à blacklist com sucesso.`,
            flags: 64
        });
    }
};