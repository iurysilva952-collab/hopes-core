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
                .setDescription('Uma nova licença foi gerada para o cliente.')
                .setThumbnail(cliente.displayAvatarURL())
                .addFields(
                    { name: '👤 Cliente', value: `${cliente}`, inline: true },
                    { name: '📦 Produto', value: produto, inline: true },
                    { name: '🟢 Status', value: 'Ativa', inline: true },
                    { name: '🔐 Chave', value: `\`${key}\``, inline: false },
                    { name: '🛠️ Criada por', value: `${interaction.user}`, inline: true },
                    { name: '🕒 Criada em', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
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

            const status = license.active ? '🟢 Ativa' : '🔴 Revogada';

            const embed = new EmbedBuilder()
                .setColor(license.active ? '#00b7ff' : '#ff3b3b')
                .setTitle('🔎 Verificação de Licença')
                .setDescription('Informações registradas para esta licença.')
                .addFields(
                    { name: '🔐 Chave', value: `\`${chave}\``, inline: false },
                    { name: '👤 Cliente', value: `<@${license.ownerId}>`, inline: true },
                    { name: '📦 Produto', value: license.product, inline: true },
                    { name: '📌 Status', value: status, inline: true },
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
            const license = getLicense(chave);

            if (!license) {
                return interaction.reply({
                    content: '❌ Licença não encontrada.',
                    flags: 64
                });
            }

            const success = revokeLicense(chave);

            if (!success) {
                return interaction.reply({
                    content: '❌ Não foi possível revogar esta licença.',
                    flags: 64
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#ff3b3b')
                .setTitle('🔴 Licença Revogada')
                .setDescription('A licença foi revogada com sucesso.')
                .addFields(
                    { name: '🔐 Chave', value: `\`${chave}\``, inline: false },
                    { name: '👤 Cliente', value: `<@${license.ownerId}>`, inline: true },
                    { name: '📦 Produto', value: license.product, inline: true },
                    { name: '🛡️ Revogada por', value: `${interaction.user}`, inline: true }
                )
                .setFooter({ text: 'Hopes Core • License System' })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                flags: 64
            });
        }
    }
};