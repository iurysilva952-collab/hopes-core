const cooldowns = new Map();

function isOnCooldown(userId, key, seconds) {
    const cooldownKey = `${key}-${userId}`;
    const now = Date.now();
    const expiresAt = cooldowns.get(cooldownKey);

    if (expiresAt && now < expiresAt) {
        return Math.ceil((expiresAt - now) / 1000);
    }

    cooldowns.set(cooldownKey, now + seconds * 1000);
    return 0;
}

module.exports = { isOnCooldown };