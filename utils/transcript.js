async function createTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: 100 });

    const sortedMessages = messages.sort(
        (a, b) => a.createdTimestamp - b.createdTimestamp
    );

    let transcript = '';
    transcript += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    transcript += '📄 HOPES DEV • TRANSCRIPT\n';
    transcript += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    transcript += `🎫 Ticket: #${channel.name}\n`;
    transcript += `📅 Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    transcript += `💬 Total de mensagens: ${sortedMessages.size}\n\n`;

    transcript += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    sortedMessages.forEach(message => {
        const author = message.author.tag;

        let content = message.content || '[Embed / Anexo / Botão]';

        content = content.replace(/<@!?(\d+)>/g, '@usuário');

        const time = new Date(
            message.createdTimestamp
        ).toLocaleString('pt-BR');

        transcript += `👤 ${author}\n`;
        transcript += `🕒 ${time}\n`;
        transcript += `💬 ${content}\n`;
        transcript += '────────────────────────────\n';
    });

    transcript += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    transcript += '🤖 Gerado automaticamente pelo Hopes Core';
    transcript += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    return Buffer.from(transcript, 'utf8');
}

module.exports = { createTranscript };