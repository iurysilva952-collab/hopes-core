async function createTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: 100 });

    const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    let transcript = `Transcript do ticket: #${channel.name}\n`;
    transcript += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    transcript += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    sortedMessages.forEach(message => {
        const author = message.author.tag;

        let content = message.content || '[Embed/Anexo/Botão]';

        content = content.replace(/<@!?(\d+)>/g, '@usuário');

        const time = new Date(message.createdTimestamp).toLocaleString('pt-BR');

        transcript += `[${time}] ${author}: ${content}\n`;
    });

    return Buffer.from(transcript, 'utf-8');
}

module.exports = { createTranscript };