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
                .setDescription('Ex: Bot de Tickets Premium')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('valor')
                .setDescription('Ex: R$ 500,00')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('prazo')
                .setDescription('Ex: 9 dias úteis')
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
            .setTitle('💎 Proposta Comercial — Hopes Dev')
            .setDescription(
`Olá, ${cliente}!

Segue abaixo a proposta personalizada preparada pela equipe **Hopes Dev**.

━━━━━━━━━━━━━━━━━━`
            )
            .addFields(
                {
                    name: '👤 Cliente',
                    value: `${cliente}`,
                    inline: true
                },
                {
                    name: '🛠️ Serviço Solicitado',
                    value: servico,
                    inline: true
                },
                {
                    name: '💵 Investimento',
                    value: valor,
                    inline: true
                },
                {
                    name: '⏳ Prazo de Entrega',
                    value: prazo,
                    inline: true
                },
                {
                    name: '📝 Observações',
                    value: observacoes,
                    inline: false
                },
                {
                    name: '📌 Status',
                    value: 'Aguardando aprovação do cliente',
                    inline: false
                }
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