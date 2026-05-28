module.exports = {
    customId: 'add_user',

    async execute(interaction) {
        await interaction.reply({
            content: '➕ Para adicionar alguém ao ticket, use:\n`/adduser @usuário`\n\nVamos criar esse comando no próximo passo.',
            flags: 64
        });
    }
};