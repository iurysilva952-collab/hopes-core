module.exports = {
    customId: 'remove_user',

    async execute(interaction) {
        await interaction.reply({
            content: '➖ Para remover alguém do ticket, use:\n`/removeuser @usuário`\n\nVamos criar esse comando no próximo passo.',
            flags: 64
        });
    }
};