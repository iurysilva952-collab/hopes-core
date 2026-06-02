module.exports = {
    color: '#00b7ff',

    brand: {
        name: 'Hopes Dev',
        botName: 'Hopes Core',
        footer: 'Hopes Dev • Premium Support System',
        logsFooter: 'Hopes Core • Ticket Logs'
    },

    roles: {
        staffKeywords: ['staff', 'fundador', 'desenvolvedor']
    },

    channels: {
        ticketsCategoryKeyword: 'tickets',
        logsKeyword: 'logs-geral',

        logs: {
            geral: 'logs-geral',
            tickets: 'logs-tickets',
            vendas: 'logs-vendas',
            licencas: 'logs-licencas',
            cupons: 'logs-cupons'
        }
    },

    cooldowns: {
        ticketCreate: 30
    },

    categories: {
        compras: '💰 Compras',
        suporte: '🛠️ Suporte',
        bots: '🤖 Bots',
        design: '🎨 Design',
        outros: '📦 Outros'
    },

    embeds: {
        success: '#00b7ff',
        warning: '#ffaa00',
        danger: '#ff3b3b',
        neutral: '#5865f2'
    },

    system: {
        backupInterval: 1000 * 60 * 60 * 24,
        transcriptRetentionDays: 7
    }
};