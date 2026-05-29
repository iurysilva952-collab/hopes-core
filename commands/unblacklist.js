const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const { removeBlacklist } = require('../utils/blacklist');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unblacklist')
        .setDescription('Remove um usuário da blacklist.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que será desbloqueado.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');

        removeBlacklist(user.id);

        await interaction.reply({
            content: `✅ ${user} foi removido da blacklist.`,
            flags: 64
        });
    }
};