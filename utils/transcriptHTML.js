const fs = require('fs');
const path = require('path');

async function generateTranscriptHTML(channel) {
    const messages = await channel.messages.fetch({ limit: 100 });

    const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    let htmlMessages = '';

    sortedMessages.forEach(message => {
        const author = message.author?.tag || 'Usuário desconhecido';
        const avatar = message.author?.displayAvatarURL?.() || '';
        const content = message.content || '[Embed / Anexo / Mensagem sem texto]';
        const date = new Date(message.createdTimestamp).toLocaleString('pt-BR');

        htmlMessages += `
            <div class="message">
                <img src="${avatar}" class="avatar">
                <div class="content">
                    <div class="header">
                        <strong>${author}</strong>
                        <span>${date}</span>
                    </div>
                    <p>${content}</p>
                </div>
            </div>
        `;
    });

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Transcript - ${channel.name}</title>
    <style>
        body {
            background: #0b0f19;
            color: #ffffff;
            font-family: Arial, sans-serif;
            padding: 30px;
        }

        .container {
            max-width: 900px;
            margin: auto;
            background: #111827;
            border: 1px solid #00b7ff;
            border-radius: 12px;
            padding: 25px;
        }

        h1 {
            color: #00b7ff;
            margin-bottom: 5px;
        }

        .subtitle {
            color: #9ca3af;
            margin-bottom: 30px;
        }

        .message {
            display: flex;
            gap: 12px;
            padding: 15px 0;
            border-bottom: 1px solid #1f2937;
        }

        .avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
        }

        .content {
            flex: 1;
        }

        .header {
            display: flex;
            justify-content: space-between;
            color: #e5e7eb;
        }

        .header span {
            color: #9ca3af;
            font-size: 12px;
        }

        p {
            white-space: pre-wrap;
            color: #d1d5db;
        }

        .footer {
            margin-top: 30px;
            color: #9ca3af;
            font-size: 13px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hopes Core Transcript</h1>
        <div class="subtitle">
            Canal: ${channel.name}<br>
            Gerado em: ${new Date().toLocaleString('pt-BR')}
        </div>

        ${htmlMessages}

        <div class="footer">
            Hopes Core • Hopes Dev • Sistema Premium
        </div>
    </div>
</body>
</html>
`;

    const transcriptsPath = path.join(__dirname, '..', 'transcripts');

    if (!fs.existsSync(transcriptsPath)) {
        fs.mkdirSync(transcriptsPath);
    }

    const fileName = `transcript-${channel.name}-${Date.now()}.html`;
    const filePath = path.join(transcriptsPath, fileName);

    fs.writeFileSync(filePath, html, 'utf8');

    return filePath;
}

module.exports = {
    generateTranscriptHTML
};