const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'remove_user_modal',

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
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false
        });

        const embed = new EmbedBuilder()
            .setColor('#ff3b3b')
            .setTitle('➖ Usuário Removido')
            .setDescription(`${member} foi removido do ticket por ${interaction.user}.`)
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};