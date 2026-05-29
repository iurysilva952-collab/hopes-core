const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'add_user_modal',

    async executeModal(interaction) {
        const userId = interaction.fields.getTextInputValue('user_id').trim();
        const channel = interaction.channel;

        const member = await interaction.guild.members.fetch(userId).catch(() => null);

        if (!member) {
            return interaction.reply({
                content: '❌ Usuário não encontrado. Verifique se o ID está correto.',
                flags: 64
            });
        }

        await channel.permissionOverwrites.edit(member.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        const embed = new EmbedBuilder()
            .setColor('#00b7ff')
            .setTitle('➕ Usuário Adicionado')
            .setDescription(`${member} foi adicionado ao ticket por ${interaction.user}.`)
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};