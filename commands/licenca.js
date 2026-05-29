const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const {
    createLicense,
    getLicense,
    revokeLicense
} = require('../utils/licenses');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('licenca')
        .setDescription('Gerenciar licenças Hopes Core.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('criar')
                .setDescription('Cria uma licença para um cliente.')
                .addUserOption(option =>
                    option
                        .setName('cliente')
                        .setDescription('Cliente dono da licença.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('produto')
                        .setDescription('Produto vinculado à licença.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('verificar')
                .setDescription('Verifica uma licença.')
                .addStringOption(option =>
                    option
                        .setName('chave')
                        .setDescription('Chave da licença.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('revogar')
                .setDescription('Revoga uma licença.')
                .addStringOption(option =>
                    option
                        .setName('chave')
                        .setDescription('Chave da licença.')
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'criar') {
            const cliente = interaction.options.getUser('cliente');
            const produto = interaction.options.getString('produto');

            const key = createLicense(cliente.id, produto, interaction.user.id);

            const embed = new EmbedBuilder()
                .setColor('#00b7ff')
                .setTitle('🔑 Licença Criada')
                .addFields(
                    { name: '👤 Cliente', value: `${cliente}`, inline: true },
                    { name: '📦 Produto', value: produto, inline: true },
                    { name: '🔐 Chave', value: `\`${key}\``, inline: false },
                    { name: '🟢 Status', value: 'Ativa', inline: true }
                )
                .setFooter({ text: 'Hopes Core • License System' })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }

        if (subcommand === 'verificar') {
            const chave = interaction.options.getString('chave').toUpperCase();
            const license = getLicense(chave);

            if (!license) {
                return interaction.reply({
                    content: '❌ Licença não encontrada.',
                    flags: 64
                });
            }

            const embed = new EmbedBuilder()
                .setColor(license.active ? '#00b7ff' : '#ff3b3b')
                .setTitle('🔎 Verificação de Licença')
                .addFields(
                    { name: '🔐 Chave', value: `\`${chave}\``, inline: false },
                    { name: '👤 Cliente', value: `<@${license.ownerId}>`, inline: true },
                    { name: '📦 Produto', value: license.product, inline: true },
                    { name: '📌 Status', value: license.active ? '🟢 Ativa' : '🔴 Revogada', inline: true },
                    { name: '🛠️ Criada por', value: `<@${license.createdBy}>`, inline: true }
                )
                .setFooter({ text: 'Hopes Core • License System' })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }

        if (subcommand === 'revogar') {
            const chave = interaction.options.getString('chave').toUpperCase();
            const success = revokeLicense(chave);

            if (!success) {
                return interaction.reply({
                    content: '❌ Licença não encontrada.',
                    flags: 64
                });
            }

            return interaction.reply({
                content: `🔴 Licença \`${chave}\` foi revogada com sucesso.`,
                flags: 64
            });
        }
    }
};