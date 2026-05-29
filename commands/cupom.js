const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const {
    createCoupon,
    removeCoupon,
    getCoupon,
    getAllCoupons
} = require('../utils/coupons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cupom')
        .setDescription('Gerenciar cupons.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('criar')
                .setDescription('Criar um cupom.')
                .addStringOption(option =>
                    option
                        .setName('codigo')
                        .setDescription('Código do cupom')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('desconto')
                        .setDescription('Desconto em %')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remover')
                .setDescription('Remover um cupom.')
                .addStringOption(option =>
                    option
                        .setName('codigo')
                        .setDescription('Código do cupom')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('ver')
                .setDescription('Ver informações de um cupom.')
                .addStringOption(option =>
                    option
                        .setName('codigo')
                        .setDescription('Código do cupom')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('listar')
                .setDescription('Listar todos os cupons.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'criar') {
            const codigo = interaction.options.getString('codigo');
            const desconto = interaction.options.getInteger('desconto');

            createCoupon(
                codigo,
                desconto,
                null,
                interaction.user.id
            );

            const embed = new EmbedBuilder()
                .setColor('#00b7ff')
                .setTitle('🎁 Cupom Criado')
                .addFields(
                    {
                        name: '🏷️ Código',
                        value: codigo.toUpperCase(),
                        inline: true
                    },
                    {
                        name: '💸 Desconto',
                        value: `${desconto}%`,
                        inline: true
                    }
                )
                .setTimestamp();

            return interaction.reply({
                embeds: [embed]
            });
        }

        if (subcommand === 'remover') {
            const codigo = interaction.options.getString('codigo');

            removeCoupon(codigo);

            return interaction.reply({
                content: `🗑️ Cupom **${codigo.toUpperCase()}** removido com sucesso.`
            });
        }

        if (subcommand === 'ver') {
            const codigo = interaction.options.getString('codigo');
            const coupon = getCoupon(codigo);

            if (!coupon) {
                return interaction.reply({
                    content: '❌ Cupom não encontrado.',
                    flags: 64
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#00b7ff')
                .setTitle('🎁 Informações do Cupom')
                .addFields(
                    {
                        name: '🏷️ Código',
                        value: codigo.toUpperCase(),
                        inline: true
                    },
                    {
                        name: '💸 Desconto',
                        value: `${coupon.discount}%`,
                        inline: true
                    }
                )
                .setTimestamp();

            return interaction.reply({
                embeds: [embed]
            });
        }

        if (subcommand === 'listar') {
            const coupons = getAllCoupons();

            const keys = Object.keys(coupons);

            if (!keys.length) {
                return interaction.reply({
                    content: '📭 Nenhum cupom cadastrado.'
                });
            }

            const description = keys
                .map(code =>
                    `🎁 **${code}** → ${coupons[code].discount}%`
                )
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor('#00b7ff')
                .setTitle('🎁 Cupons Ativos')
                .setDescription(description)
                .setTimestamp();

            return interaction.reply({
                embeds: [embed]
            });
        }
    }
};