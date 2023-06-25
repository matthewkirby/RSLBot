const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
require("dotenv").config();
const rs = require("./roll_seed.js");
const tools = require("./bot_tools.js");


// Initialize the bot
const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});


// Message for when we boot up
bot.on("ready", () => {
    bot.user.setActivity({name: "DM me for a seed!", game: "DM me!", type: ActivityType.Playing});
    console.log("RSLBot is online!");
});


bot.on("messageCreate", msg => {
    if(msg.channel.type === 1) { 
        parseDM(msg);
    }
});


function parseDM(msg) {
    const user = `${msg.author.username}#${msg.author.discriminator}`;
    const ctime = new Date(Date.now());
    tools.record_log(bot, `[${ctime}] ${user}: ${msg.content}`);
    if(msg.author.bot) { return; }

    // Check for a bot restart command
    if(msg.content.startsWith("!reset") && user == "Xopar#0958") {
        process.exit();
    }

    // Parse generic message and send button options
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('roll_Season5')
                .setLabel('Roll an S5 RSL Seed')
                .setStyle(ButtonStyle.Primary),
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
bot.on('interactionCreate', interaction => {
	if (!interaction.isButton()) return;
    const cid = interaction.customId;
    const ctime = new Date(Date.now());
    const user = `${interaction.user.username}#${interaction.user.discriminator}`;

    if(cid.startsWith("roll_")) {
        rs.roll_seed(interaction, user, ctime);
    }
    else if(cid === "unlock_log") {
        rs.unlock_seed(interaction);
    }
    else if(cid === "view_presets") {
        interaction.update({
            content: "Roll a seed with one of the following presets:",
            components:[presetrow]
        })
    }



});


const presetrow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('roll_Season5')
            .setLabel('Roll an S5 RSL Seed')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('roll_Beginner')
            .setLabel('Roll a Beginner RSL Seed')
            .setStyle(ButtonStyle.Secondary),
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
