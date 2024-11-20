const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, GatewayIntentBits, Partials, ActivityType, Events } = require('discord.js');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
require("dotenv").config();
const rs = require("./roll_seed.js");
const { metadata } = require("./metadata.js");


// Initialize the bot
const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

// Attach the commands
bot.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
        console.log(`Loaded implementation for command: ${file}`)
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			bot.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


// Message for when we boot up
bot.on(Events.ClientReady, () => {
    bot.user.setActivity({name: "DM me for a seed!", game: "DM me!", type: ActivityType.Playing});
    console.log("RSLBot is online!");
});


bot.on(Events.MessageCreate, msg => {
    if(msg.channel.type === 1) { 
        parseDM(msg);
    }
});


function parseDM(msg) {
    if(msg.author.bot) { return; }
    const userinfo = parse_user_info(msg, "MESSAGE");

    // Check for a bot restart command
    if (msg.content.startsWith("!reset")) {
        if (userinfo.user_level === "admin") {
            msg.author.send({ content: "Restarting..." });
            process.exit();
        }
        else {
            msg.author.send({ content: "Permission denied." });
            return;
        }
    }

    // Return the user's status
    if (msg.content.startsWith("!status")) {
        msg.author.send({ content: `You have permissions level ${userinfo.user_level}.` });
        return;
    }

    // Parse generic message and send button options
    const row = new ActionRowBuilder()
        .addComponents(
            rsl_seasonal_button,
            rsl_lite_button,
            new ButtonBuilder()
                .setCustomId('view_presets')
                .setLabel('View Presets')
                .setStyle(ButtonStyle.Secondary)
        )
    
    msg.author.send({
        content: "Click a button below to see what I can do!",
        components: [row]
    });    
}


// Parse buttons
bot.on(Events.InteractionCreate, interaction => {
    if (interaction.isButton()) {
        handleButtonInteraction(interaction);
    } else {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return
        }
        command.execute(interaction);
    }

});

function handleButtonInteraction(interaction) {
    const ctime = new Date(Date.now());
    const cid = interaction.customId;
    const userinfo = parse_user_info(interaction, "INTERACTION");

    if(cid.startsWith("roll_")) {
        rs.rollSeed(interaction, userinfo, ctime);
    }
    else if(cid === "unlock_log") {
        rs.unlockSeed(interaction);
    }
    else if(cid === "view_presets") {
        interaction.update({
            content: "Roll a seed with one of the following presets:",
            components:[presetrow]
        })
    }
}


function set_user_level(username) {
    if (metadata.admin.includes(username)) {
        return "admin";
    }
    else if (metadata.moderator.includes(username)) {
        return "moderator";
    }
    else if (metadata.organizer.includes(username)) {
        return "organizer";
    }
    else {
        return "user";
    }
}


function parse_user_info(event, event_type) {
    let user_object = null;
    if (event_type === "INTERACTION") {
        user_object = event.user;
    }
    else if (event_type === "MESSAGE") {
        user_object = event.author;
    }
    else {
        console.log(`While parsing user info, event type ${event_type} not recognized.`)
        return null;
    }
    const username = `${user_object.username}#${user_object.discriminator}`;
    const user_level = set_user_level(username);
    return { username: username, user_level: user_level }
}

const rsl_seasonal_button = new ButtonBuilder()
    .setCustomId(`roll_Season${metadata.season}`)
    .setLabel(`Roll an S${metadata.season} RSL Seed (v${metadata.rslVersion})`)
    .setStyle(ButtonStyle.Primary);

const rsl_lite_button = new ButtonBuilder()
    .setCustomId('roll_Lite')
    .setLabel("Roll an RSL Lite Seed")
    .setStyle(ButtonStyle.Success)

const presetrow = new ActionRowBuilder()
    .addComponents(
        rsl_seasonal_button,
        new ButtonBuilder()
            .setCustomId('roll_Lite')
            .setLabel('Roll an RSL Lite Seed')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('roll_Intermediate')
            .setLabel('Roll an Intermediate RSL Seed')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roll_Bingo')
            .setLabel('Roll a Bingo RSL Seed')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('roll_DDR')
            .setLabel('Roll a DDR RSL Seed')
            .setStyle(ButtonStyle.Secondary)
    )


bot.login(process.env.CLIENT_TOKEN);