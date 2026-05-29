const { EmbedBuilder } = require('discord.js');
const config = require('../config/ticketConfig');

module.exports = {
    customId: 'claim_ticket',

    async execute(interaction) {
        const member = interaction.member;
        const channel = interaction.channel;

        const isStaff = member.roles.cache.some(role =>
            config.roles.staffKeywords.some(keyword =>
                role.name.toLowerCase().includes(keyword)
            )
        );

        if (!isStaff) {
            return interaction.reply({
                content: '❌ Apenas membros da equipe podem assumir tickets.',
                flags: 64
            });
        }

        if (channel.name.includes('-claim')) {
            return interaction.reply({
                content: '❌ Este ticket já foi assumido por um membro da equipe.',
                flags: 64
            });
        }

        const oldChannelName = channel.name;
        const newChannelName = `${oldChannelName}-claim`;

        await channel.setName(newChannelName).catch(() => {});
        await channel.setTopic(`claimedBy=${interaction.user.id};`).catch(() => {});

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('👤 Atendimento Assumido')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(
`O atendimento foi assumido por ${interaction.user}.

A partir de agora, este membro da equipe será responsável por acompanhar o ticket.`
            )
            .addFields(
                {
                    name: '🛠️ Staff responsável',
                    value: `${interaction.user}`,
                    inline: true
                },
                {
                    name: '🟢 Status',
                    value: 'Em Atendimento',
                    inline: true
                },
                {
                    name: '📂 Canal',
                    value: `${channel}`,
                    inline: true
                }
            )
            .setFooter({
                text: `${config.brand.botName} • Atendimento Profissional`
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });

        const logsChannel = interaction.guild.channels.cache.find(channel =>
            channel.name.toLowerCase().includes(config.channels.logsKeyword)
        );

        if (logsChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('👤 Ticket Assumido')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription('Um ticket foi assumido por um membro da equipe.')
                .addFields(
                    {
                        name: '🛠️ Staff',
                        value: `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: '📄 Canal antigo',
                        value: `#${oldChannelName}`,
                        inline: true
                    },
                    {
                        name: '📌 Canal atual',
                        value: `${channel}`,
                        inline: true
                    },
                    {
                        name: '🕒 Horário',
                        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                        inline: false
                    }
                )
                .setFooter({
                    text: config.brand.logsFooter
                })
                .setTimestamp();

            await logsChannel.send({
                embeds: [logEmbed]
            });
        }
    }
};