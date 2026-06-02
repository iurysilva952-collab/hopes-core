require('dotenv').config();

const fs = require('fs');

const {
    Client,
    Collection,
    GatewayIntentBits,
    Events,
    REST,
    Routes,
    ActivityType
} = require('discord.js');

const { backupDatabase } = require('./utils/backup');
const { cleanOldTranscripts } = require('./utils/cleanTranscripts');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.buttons = new Collection();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    client.buttons.set(button.customId, button);
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🔄 Registrando comandos...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('✅ Comandos registrados.');
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
})();

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot online como ${client.user.tag}`);

    client.user.setPresence({
        activities: [
            {
                name: '🎫 Hopes Dev Support',
                type: ActivityType.Watching
            }
        ],
        status: 'online'
    });

    backupDatabase();
    cleanOldTranscripts();

    setInterval(() => {
        backupDatabase();
    }, 1000 * 60 * 60 * 24);

    setInterval(() => {
        cleanOldTranscripts();
    }, 1000 * 60 * 60 * 24);
});

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            let component = client.buttons.get(interaction.customId);

            if (!component && interaction.customId.startsWith('avaliacao_')) {
                component = client.buttons.get('avaliacao');
            }

            if (!component && interaction.customId.startsWith('sugestao_')) {
                component = client.buttons.get('sugestao');
            }

            if (!component) return;

            return await component.execute(interaction, client);
        }

        if (interaction.isModalSubmit()) {
            let component = null;

            if (interaction.customId.startsWith('ticket_form_')) {
                component = client.buttons.get('ticket_select');
            }

            if (interaction.customId.startsWith('avaliacao_modal_')) {
                component = client.buttons.get('avaliacao');
            }

            if (interaction.customId === 'add_user_modal') {
                component = client.buttons.get('add_user_modal');
            }

            if (interaction.customId === 'remove_user_modal') {
                component = client.buttons.get('remove_user_modal');
            }

            if (!component || !component.executeModal) return;

            return await component.executeModal(interaction, client);
        }

        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        await command.execute(interaction, client);

    } catch (error) {
        console.error('❌ Erro na interação:', error);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: '❌ Ocorreu um erro ao executar esta interação.',
                flags: 64
            });
        } else {
            await interaction.reply({
                content: '❌ Ocorreu um erro ao executar esta interação.',
                flags: 64
            });
        }
    }
});

client.login(process.env.TOKEN);