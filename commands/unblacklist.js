const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
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

        const logsChannel = interaction.guild.channels.cache.find(channel =>
            channel.name.toLowerCase().includes('logs')
        );

        if (logsChannel) {
            const embed = new EmbedBuilder()
                .setColor('#00b7ff')
                .setTitle('✅ Usuário Removido da Blacklist')
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