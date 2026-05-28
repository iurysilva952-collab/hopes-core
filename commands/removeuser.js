const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeuser')
        .setDescription('Remove um usuário do ticket.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuário que será removido do ticket.')
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
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false
        });

        return interaction.reply({
            content: `✅ ${user} foi removido do ticket com sucesso.`
        });
    }
};