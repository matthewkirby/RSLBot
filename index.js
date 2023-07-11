const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
require("dotenv").config();
const rs = require("./roll_seed.js");


const RSLMETADATA = {
    season: 6,
    ootrversion: "7.1.143",
    admin: ["xopar#0"],
    // These are the RSL organizers
    moderator: [".cola#0", "cubsrule21#0", "emosoda#0", "kirox#0", "slyryd#0", "timmy2405#0", "trenter_tr#0"],
    organizer: []
};

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
            new ButtonBuilder()
                .setCustomId(`roll_Season${RSLMETADATA.season}`)
                .setLabel(`Roll an S${RSLMETADATA.season} RSL Seed`)
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
    const ctime = new Date(Date.now());
    const cid = interaction.customId;
    const userinfo = parse_user_info(interaction, "INTERACTION");

    if(cid.startsWith("roll_")) {
        rs.roll_seed(interaction, userinfo, ctime, RSLMETADATA);
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


function set_user_level(username) {
    if (RSLMETADATA.admin.includes(username)) {
        return "admin";
    }
    else if (RSLMETADATA.moderator.includes(username)) {
        return "moderator";
    }
    else if (RSLMETADATA.organizer.includes(username)) {
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


const presetrow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId(`roll_Season${RSLMETADATA.season}`)
            .setLabel(`Roll an S${RSLMETADATA.season} RSL Seed`)
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
