const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adduser')
        .setDescription('Adiciona um usuário ao ticket.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que será adicionado ao ticket.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const channel = interaction.channel;

        if (!channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: '❌ Este comando só pode ser usado dentro de um ticket.',
                flags: 64
            });
        }

        await channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        return interaction.reply({
            content: `✅ ${user} foi adicionado ao ticket com sucesso.`
        });
    }
};