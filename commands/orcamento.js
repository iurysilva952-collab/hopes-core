const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/ticketConfig');
const { getCoupon } = require('../utils/coupons');

function findLogsChannel(guild) {
    return guild.channels.cache.find(channel =>
        channel.name.toLowerCase().includes('logs')
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('orcamento')
        .setDescription('Gera uma proposta/orçamento profissional.')
        .addUserOption(option =>
            option.setName('cliente').setDescription('Cliente do orçamento.').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('servico').setDescription('Ex: Bot de Tickets Premium').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('valor').setDescription('Ex: R$ 500,00').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('prazo').setDescription('Ex: 9 dias úteis').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('observacoes').setDescription('Observações adicionais.').setRequired(false)
        )
        .addStringOption(option =>
            option.setName('cupom').setDescription('Cupom de desconto. Ex: HOPES10').setRequired(false)
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
        const observacoes = interaction.options.getString('observacoes') || 'Sem observações adicionais.';
        const cupomCode = interaction.options.getString('cupom');

        let cupomTexto = 'Nenhum cupom aplicado.';
        let descontoTexto = 'Sem desconto aplicado.';

        if (cupomCode) {
            const coupon = getCoupon(cupomCode);

            if (!coupon) {
                return interaction.reply({
                    content: `❌ O cupom **${cupomCode.toUpperCase()}** não existe.`,
                    flags: 64
                });
            }

            cupomTexto = `🎁 **${cupomCode.toUpperCase()}**`;
            descontoTexto = `${coupon.discount}% de desconto aplicado.`;
        }

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('💎 Proposta Comercial — Hopes Dev')
            .setThumbnail(cliente.displayAvatarURL())
            .setDescription(
`Olá, ${cliente}!

A equipe **Hopes Dev** preparou uma proposta personalizada para o seu projeto.

━━━━━━━━━━━━━━━━━━`
            )
            .addFields(
                {
                    name: '👤 Cliente',
                    value: `${cliente}`,
                    inline: true
                },
                {
                    name: '🛠️ Serviço',
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
                    name: '🎁 Cupom',
                    value: cupomTexto,
                    inline: true
                },
                {
                    name: '📉 Desconto',
                    value: descontoTexto,
                    inline: true
                },
                {
                    name: '📝 Observações',
                    value: observacoes,
                    inline: false
                },
                {
                    name: '📌 Status',
                    value: 'Aguardando aprovação do cliente.',
                    inline: false
                },
                {
                    name: '✅ Próximo passo',
                    value: 'Caso aprove a proposta, responda neste atendimento para iniciarmos o desenvolvimento.',
                    inline: false
                }
            )
            .setFooter({
                text: 'Hopes Dev • Premium Discord Solutions'
            })
            .setTimestamp();

        const logsChannel = findLogsChannel(interaction.guild);

        if (logsChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('💎 Orçamento Gerado')
                .setDescription('Uma nova proposta comercial foi criada pela equipe.')
                .addFields(
                    {
                        name: '👤 Cliente',
                        value: `${cliente}`,
                        inline: true
                    },
                    {
                        name: '🛠️ Serviço',
                        value: servico,
                        inline: true
                    },
                    {
                        name: '💵 Valor',
                        value: valor,
                        inline: true
                    },
                    {
                        name: '⏳ Prazo',
                        value: prazo,
                        inline: true
                    },
                    {
                        name: '🎁 Cupom',
                        value: cupomTexto,
                        inline: true
                    },
                    {
                        name: '📉 Desconto',
                        value: descontoTexto,
                        inline: true
                    },
                    {
                        name: '🛡️ Gerado por',
                        value: `${interaction.user}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: 'Hopes Core • Budget Logs'
                })
                .setTimestamp();

            await logsChannel.send({
                embeds: [logEmbed]
            });
        }

        await interaction.reply({
            embeds: [embed]
        });
    }
};