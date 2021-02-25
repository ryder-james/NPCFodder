require('dotenv').config();

const Discord = require('discord.js');

let { prefix, gmRole } = require('./config.json');

const TOKEN = process.env.TOKEN;
const CLIENT = new Discord.Client();
const PROXY_PATTERN = /^{(.*\w.*)} (.*\w.*)/

CLIENT.once('ready', () => {
	console.log('Ready!');
});

CLIENT.on('message', async msg => {
	if (!msg.content.startsWith(prefix)) {
		if (msg.author.bot || msg.webhookID) {
			return;
		}

		let match = msg.content.match(PROXY_PATTERN);
		if (!match || !hasRole(msg.member, gmRole)) {
			return;
		}

		proxySend(msg, match[1].trim(), match[2].trim());
	} else {
		const args = msg.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();

		if (commandName === 'prefix' && args) {
			if (isGM(msg.member)) {
				prefix = args[0];
				msg.channel.send(`Prefix successfully changed to ${prefix}`);
			} else {
				msg.reply('You must be a GM to use that command.');
			}
		} else if (commandName === 'gmrole' && args) {
			if (isGM(msg.member)) {
				gmRole = args[0];
				msg.channel.send(`GM Role successfully changed to ${gmRole}`);
			} else {
				msg.reply('You must be a GM to use that command.');
			}
		}
	}

});

const isGM = (member) => {
	return hasRole(member, gmRole);
}

const hasRole = (member, role) => {
	return member.roles.cache.some(r => r.name === role);
}

const proxySend = async (msg, name, content) => {
	const channel = msg.channel;
	try {
		const webhooks = await channel.fetchWebhooks();
		const webhook = webhooks.first();

		await webhook.send(content, {
			username: name
		});

		msg.delete();
	} catch (err) {
		console.log(`Error trying to send: ${err}`);
	}
}

CLIENT.login(TOKEN)
