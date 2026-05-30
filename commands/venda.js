const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { registerSale, getSales } = require('../utils/sales');
const config = require('../config/ticketConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('venda')
        .setDescription('Gerenciar vendas da Hopes Dev.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('registrar')
                .setDescription('Registra uma nova venda.')
                .addUserOption(option =>
                    option.setName('cliente').setDescription('Cliente da venda.').setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('servico').setDescription('Serviço vendido.').setRequired(true)
                )
                .addNumberOption(option =>
                    option.setName('valor').setDescription('Valor da venda. Ex: 500').setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('status')
                        .setDescription('Status da venda.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Pago', value: 'pago' },
                            { name: 'Pendente', value: 'pendente' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('resumo').setDescription('Mostra o resumo financeiro.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('listar').setDescription('Lista as últimas vendas.')
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

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'registrar') {
            const cliente = interaction.options.getUser('cliente');
            const servico = interaction.options.getString('servico');
            const valor = interaction.options.getNumber('valor');
            const status = interaction.options.getString('status');

            const sale = registerSale(
                cliente.id,
                servico,
                valor,
                status,
                interaction.user.id
            );

            const embed = new EmbedBuilder()
                .setColor(status === 'pago' ? '#00b7ff' : '#ffaa00')
                .setTitle('💰 Venda Registrada')
                .addFields(
                    { name: '🆔 ID', value: sale.id, inline: true },
                    { name: '👤 Cliente', value: `${cliente}`, inline: true },
                    { name: '🛠️ Serviço', value: servico, inline: false },
                    { name: '💵 Valor', value: `R$ ${Number(valor).toFixed(2)}`, inline: true },
                    { name: '📌 Status', value: status === 'pago' ? '✅ Pago' : '⏳ Pendente', inline: true }
                )
                .setFooter({ text: 'Hopes Core • Sales System' })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }

        if (subcommand === 'resumo') {
            const sales = getSales();

            const total = sales.reduce((acc, sale) => acc + sale.value, 0);
            const paid = sales
                .filter(sale => sale.status === 'pago')
                .reduce((acc, sale) => acc + sale.value, 0);
            const pending = sales
                .filter(sale => sale.status === 'pendente')
                .reduce((acc, sale) => acc + sale.value, 0);

            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('📊 Resumo Financeiro')
                .addFields(
                    { name: '🧾 Vendas Registradas', value: `${sales.length}`, inline: true },
                    { name: '💰 Total Vendido', value: `R$ ${total.toFixed(2)}`, inline: true },
                    { name: '✅ Pago', value: `R$ ${paid.toFixed(2)}`, inline: true },
                    { name: '⏳ Pendente', value: `R$ ${pending.toFixed(2)}`, inline: true }
                )
                .setFooter({ text: 'Hopes Core • Finance Dashboard' })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }

        if (subcommand === 'listar') {
            const sales = getSales().slice(-10).reverse();

            if (!sales.length) {
                return interaction.reply({
                    content: '📭 Nenhuma venda registrada ainda.',
                    flags: 64
                });
            }

            const description = sales.map(sale => {
                const status = sale.status === 'pago' ? '✅ Pago' : '⏳ Pendente';

                return `**ID:** ${sale.id}
👤 Cliente: <@${sale.clientId}>
🛠️ Serviço: ${sale.service}
💵 Valor: R$ ${sale.value.toFixed(2)}
📌 Status: ${status}`;
            }).join('\n\n');

            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('🧾 Últimas Vendas')
                .setDescription(description)
                .setFooter({ text: 'Hopes Core • Sales List' })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }
    }
};