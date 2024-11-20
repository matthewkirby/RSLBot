const { SlashCommandBuilder } = require('discord.js');
const { isInteractionUserAdmin } = require('../../tools');
const fetch = require('node-fetch');
const { metadata } = require('../../metadata');


async function recordRatedAsync(interaction) {
	if (!isInteractionUserAdmin(interaction)) {
		interaction.reply('This command is restricted to RSL admins.')
		return;
	}

	const async_number = interaction.options.getInteger('number');

	await interaction.reply(`⏳ Recording rated async ${async_number}...`);

	// Make the POST request to roll the seed
	fetch(`${metadata.backendRoot}/record_rated_async`, {
		method: 'post',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			'async_number': async_number,
			'api_key': process.env.RSL_API_KEY
		})
	})
		.then(res => {
			return res.json();
		})
		.then(json => {
			interaction.editReply(json.message);
		})
		.catch(error => {
			console.log(error);
		});
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('record_rated_async')
		.setDescription('Record the results from a given rated async.')
		.addIntegerOption(option =>
			option.setName('number')
				.setDescription('The rated async number.')
				.setRequired(true)
		),
	async execute(interaction) {
		await recordRatedAsync(interaction);
	},
};
