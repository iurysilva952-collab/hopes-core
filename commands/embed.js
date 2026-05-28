const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Envia uma embed personalizada.')
        .addStringOption(option =>
            option
                .setName('titulo')
                .setDescription('Título da embed')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('descricao')
                .setDescription('Descrição da embed')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const titulo = interaction.options.getString('titulo');
        const descricao = interaction.options.getString('descricao');

        const embed = new EmbedBuilder()
            .setColor('#00b0f4')
            .setTitle(titulo)
            .setDescription(descricao)
            .setFooter({
                text: 'Hopes Core • Premium System'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });

    }
};