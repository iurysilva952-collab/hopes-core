const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/ticketConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('orcamento')
        .setDescription('Gera uma proposta/orçamento profissional.')
        .addUserOption(option =>
            option
                .setName('cliente')
                .setDescription('Cliente do orçamento.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('servico')
                .setDescription('Serviço solicitado.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('valor')
                .setDescription('Valor do serviço. Ex: R$ 150,00')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('prazo')
                .setDescription('Prazo de entrega. Ex: 3 dias úteis')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('observacoes')
                .setDescription('Observações adicionais.')
                .setRequired(false)
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

        const cliente = interaction.options.getUser('cliente');
        const servico = interaction.options.getString('servico');
        const valor = interaction.options.getString('valor');
        const prazo = interaction.options.getString('prazo');
        const observacoes = interaction.options.getString('observacoes') || 'Sem observações.';

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('💰 Orçamento Hopes Dev')
            .setDescription('Proposta personalizada gerada pela equipe Hopes Dev.')
            .addFields(
                { name: '👤 Cliente', value: `${cliente}`, inline: true },
                { name: '🛠️ Serviço', value: servico, inline: true },
                { name: '💵 Valor', value: valor, inline: true },
                { name: '⏳ Prazo', value: prazo, inline: true },
                { name: '📝 Observações', value: observacoes, inline: false }
            )
            .setFooter({
                text: 'Hopes Dev • Premium Discord Solutions'
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};