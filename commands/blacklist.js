const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
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

        const logsChannel = interaction.guild.channels.cache.find(channel =>
            channel.name.toLowerCase().includes('logs')
        );

        if (logsChannel) {
            const embed = new EmbedBuilder()
                .setColor('#ff3b3b')
                .setTitle('🚫 Usuário Adicionado à Blacklist')
                .addFields(
                    { name: '👤 Usuário', value: `${user}`, inline: true },
                    { name: '🆔 ID', value: user.id, inline: true },
                    { name: '🛠️ Responsável', value: `${interaction.user}`, inline: true }
                )
                .setFooter({ text: 'Hopes Core • Blacklist Logs' })
                .setTimestamp();

            await logsChannel.send({ embeds: [embed] });
        }
    }
};