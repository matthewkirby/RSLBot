const Discord = require("discord.js");
require("dotenv").config();
const rs = require("./roll_seed.js");
const tools = require("./bot_tools.js");

// Initialize the bot
const bot = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],  partials: ["CHANNEL"]
});


// Message for when we boot up
bot.on("ready", () => {
    bot.user.setActivity("DM me to generate a seed!", { type: "PLAYING" });
    console.log("RSLBot is online!");
});

bot.on("messageCreate", msg => {
    if(msg.channel.type == 'DM') { 
        parseDM(msg);
    }
});

function parseDM(msg) {
    const user = `${msg.author.username}#${msg.author.discriminator}`;
    const ctime = new Date(Date.now());
    tools.record_log(`[${ctime}] ${user}: ${msg.content}`);
    if(msg.author.bot) { return; }

    if(msg.content.startsWith("!seed"))
        rs.roll_seed(msg, user, ctime);
    else if(msg.content.startsWith("!unlock") || msg.content.startsWith("!log"))
        rs.unlock_seed(msg, user, ctime);
    else if(msg.content.startsWith("!preset"))
        msg.author.send(preset_list);
    else if(msg.content.startsWith("!help") || msg.content.startsWith("!command"))
        msg.author.send(helpme);
    else if(msg.content.startsWith("!contact"))
        msg.author.send("Hit up Xopar#0958 or join my discord: https://discord.com/invite/2gn8Abj");
    else
        msg.author.send("Hi! You should say `!help` or `!seed` or something =P");
}

const helpme = 
`Hi my name is RSLBot! Nice to meet you\~

__This is what I was made to do__
- \`!seed\` Will roll a typical RSL seed with the default seasonal weights. I can only roll one seed for you every 15 minutes.
- \`!seed <preset>\` Will roll an RSL seed with the specified preset. For example, to roll a DDR RSL seed, type \`!seed ddr\`.
- \`!presets\` Will list all available presets. If you would like your community to be represented by a preset, please reach out to Xopar!
- \`!unlock\` or \`!log\` Will unlock the spoiler log of the last seed you rolled with me.
- \`!contact\` For author contact information!

__Here are some other useful things__
**RSL Leaderboard**: https://rsl-leaderboard.web.app/

Xopar made me so if you want to complain about your seed, its his fault.
`

const preset_list =
`- \`beginner\` Disables most of Ganon's Castle trials, master quest, overworld entrance randomizer, songs on dungeon rewards, minimal item pool, quad damage, one hit ko, enables a couple of generic speed ups. Also limits skulltula bridge and ganon boss key requirement to a maximum of 50 and restricts entrance randomizer to one of grotto, interior or dungeons.
- \`intermediate\` Restricts trials to less than 4, and gives either 0 or 1 master quest dungeon. Disables overworld entrance randomizer and one hit ko.
- \`bingo\` Using the default settings as a base, restricts settings to ensure all bingo goals are completable
- \`intermediate_bingo\` Using the intermediate settings as a base, restricts settings to ensure all bingo goals are completable
- \`ddr\` Designed for the DDR ruleset. Enables useful cutscenes and disables damage multipliers for doing glitches.
- \`xopar\` The xopar special.
`

bot.login(process.env.CLIENT_TOKEN);
