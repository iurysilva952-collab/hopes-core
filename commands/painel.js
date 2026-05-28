const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel')
        .setDescription('Envia o painel de atendimento.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#00b7ff')
            .setTitle('🎫 Central de Atendimento')
            .setDescription(
`Bem-vindo(a) ao suporte oficial da Hopes Dev.

Selecione abaixo o tipo de atendimento que você precisa.

💰 **Compras** — Orçamentos e contratação
🛠️ **Suporte** — Ajuda e problemas técnicos
🤖 **Bots** — Criação e configuração de bots
🎨 **Design** — Identidade visual e personalização
📦 **Outros** — Assuntos gerais

Nossa equipe responderá o mais rápido possível.`
            )
            .setFooter({
                text: 'Hopes Dev • Premium Support'
            });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Selecione o tipo de atendimento')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Compras')
                    .setDescription('Orçamentos e contratação de serviços.')
                    .setEmoji('💰')
                    .setValue('compras'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Suporte')
                    .setDescription('Ajuda, dúvidas ou problemas técnicos.')
                    .setEmoji('🛠️')
                    .setValue('suporte'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Bots')
                    .setDescription('Criação, ajustes ou configuração de bots.')
                    .setEmoji('🤖')
                    .setValue('bots'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Design')
                    .setDescription('Identidade visual, banners e personalização.')
                    .setEmoji('🎨')
                    .setValue('design'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Outros')
                    .setDescription('Outros assuntos relacionados à Hopes Dev.')
                    .setEmoji('📦')
                    .setValue('outros')
            );

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};