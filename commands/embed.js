const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const config = require('../config/ticketConfig');

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
        ),

    async execute(interaction) {

        const member = interaction.member;

        const isStaff = member.roles.cache.some(role =>
            config.roles.staffKeywords.some(keyword =>
                role.name.toLowerCase().includes(keyword)
            )
        );

        if (!isStaff) {
            return interaction.reply({
                content: '❌ Você não tem permissão para usar este comando.',
                flags: 64
            });
        }

        const titulo = interaction.options.getString('titulo');
        const descricao = interaction.options.getString('descricao');

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(titulo)
            .setDescription(descricao)
            .setFooter({
                text: `${config.brand.botName} • Premium System`
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });

    }
};