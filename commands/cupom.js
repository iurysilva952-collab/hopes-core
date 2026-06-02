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
            const codigo = interaction.options.getString('codigo').toUpperCase();
            const desconto = interaction.options.getInteger('desconto');

            if (desconto < 1 || desconto > 100) {
                return interaction.reply({
                    content: '❌ O desconto deve estar entre 1% e 100%.',
                    flags: 64
                });
            }

            createCoupon(
                codigo,
                desconto,
                null,
                interaction.user.id
            );

            const embed = new EmbedBuilder()
                .setColor('#00b7ff')
                .setTitle('🎁 Cupom Criado')
                .setDescription('Novo cupom promocional criado com sucesso.')
                .addFields(
                    {
                        name: '🏷️ Código',
                        value: `\`${codigo}\``,
                        inline: true
                    },
                    {
                        name: '💸 Desconto',
                        value: `${desconto}%`,
                        inline: true
                    },
                    {
                        name: '🛠️ Criado por',
                        value: `${interaction.user}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: 'Hopes Core • Coupon System'
                })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }

        if (subcommand === 'remover') {
            const codigo = interaction.options.getString('codigo').toUpperCase();
            const coupon = getCoupon(codigo);

            if (!coupon) {
                return interaction.reply({
                    content: '❌ Cupom não encontrado.',
                    flags: 64
                });
            }

            removeCoupon(codigo);

            const embed = new EmbedBuilder()
                .setColor('#ff3b3b')
                .setTitle('🗑️ Cupom Removido')
                .setDescription('O cupom foi removido com sucesso.')
                .addFields(
                    {
                        name: '🏷️ Código',
                        value: `\`${codigo}\``,
                        inline: true
                    },
                    {
                        name: '💸 Desconto',
                        value: `${coupon.discount}%`,
                        inline: true
                    },
                    {
                        name: '🛡️ Removido por',
                        value: `${interaction.user}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: 'Hopes Core • Coupon System'
                })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }

        if (subcommand === 'ver') {
            const codigo = interaction.options.getString('codigo').toUpperCase();
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
                        value: `\`${codigo}\``,
                        inline: true
                    },
                    {
                        name: '💸 Desconto',
                        value: `${coupon.discount}%`,
                        inline: true
                    },
                    {
                        name: '📌 Status',
                        value: '🟢 Ativo',
                        inline: true
                    }
                )
                .setFooter({
                    text: 'Hopes Core • Coupon System'
                })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }

        if (subcommand === 'listar') {
            const coupons = getAllCoupons() || {};
            const keys = Object.keys(coupons);

            if (!keys.length) {
                return interaction.reply({
                    content: '📭 Nenhum cupom cadastrado.',
                    flags: 64
                });
            }

            const description = keys
                .map(code => `🎁 **${code}** → **${coupons[code].discount}%**`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor('#00b7ff')
                .setTitle('🎁 Cupons Ativos')
                .setDescription(description)
                .addFields({
                    name: '📊 Total',
                    value: `${keys.length} cupons ativos`,
                    inline: false
                })
                .setFooter({
                    text: 'Hopes Core • Coupon System'
                })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }
    }
};