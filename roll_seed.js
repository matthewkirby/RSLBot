const {PythonShell} = require('python-shell');
const proc = require('process');
const fetch = require('node-fetch');
const fs = require('fs');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')


const preset_list = {
    'Beginner': '--override=weights/beginner_override.json',
    'Intermediate': '--override=weights/intermediate_override.json',
    'DDR': '--override=weights/ddr_override.json',
    'Bingo': '--override=weights/bingo_override.json',
}


// Make button to unlock spoiler log
const unlockLogButton = new ButtonBuilder()
    .setCustomId('unlock_log')
    .setLabel('Unlock Spoiler Log')
    .setStyle(ButtonStyle.Secondary);

const logUnlockedButton = new ButtonBuilder()
    .setCustomId('log_unlocked')
    .setLabel('Log Unlocked')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

function make_seed_buttons(seed_url, unlocked) {
    const seed_button = new ButtonBuilder()
        .setURL(seed_url)
        .setLabel("Download Seed")
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder()
        .addComponents(seed_button);
    if(unlocked === null) { /* pass */ }
    else if(unlocked) { row.addComponents(logUnlockedButton); }
    else { row.addComponents(unlockLogButton); }
    return row;
}


 // Load the seed log
let seed_log = null;
const seed_log_path = 'data/seed_log.json';
if(fs.existsSync(seed_log_path)) {
    seed_log = JSON.parse(fs.readFileSync(seed_log_path));
} else {
    seed_log = {};
    fs.writeFileSync(seed_log_path, JSON.stringify(seed_log, null, 4));
}


function roll_seed(interaction, userinfo, ctime, RSLMETADATA) {
    // Test if the user has requested too many seeds
    const eligibility = check_seed_eligibility(userinfo, ctime);
    if(!eligibility.status) {
        interaction.update({
            content: `Please wait at least ${eligibility.cooldown / 60} minutes between seeds. You have ${eligibility.remaining} seconds remaining.`,
            components: []
        });
        return;
    }

    // Parse the preset and update message
    let preset = null;
    const presetname = interaction.customId.split("roll_")[1];
    if(presetname in preset_list) {
        interaction.update({content: `Rolling a seed with ${presetname} weights`, components: [] });
        preset = preset_list[presetname];
    } else {
        interaction.update({content: `Rolling a seed with Season ${RSLMETADATA.season} weights`, components: [] });
    }

    // Roll the seed
    proc.chdir('plando-random-settings')
    const pyargs = preset === null ? ['--no_seed'] : ['--no_seed', preset];
    const pyoptions = { pythonPath: '/usr/bin/python3', args: pyargs }
    PythonShell.run("RandomSettingsGenerator.py", pyoptions, (error, results) => {
        if(error) throw error;
        if(results.at(-1).startsWith('Plando File')) {
            const plando_path = 'plando-random-settings/data/' + results.at(-1).split(':').at(-1).trim();
            const settings = JSON.parse(fs.readFileSync(plando_path)).settings;
            settings.world_count = 1;
            settings.create_spoiler = true;
            settings.randomize_settings = false;
        
            // Make the POST request to roll the seed
            fetch(`https://ootrandomizer.com/api/v2/seed/create?key=${process.env.OOTR_API_KEY}&version=devRSL_${RSLMETADATA.ootrversion}&locked`, {
                method: 'post',
                body: JSON.stringify(settings),
                headers: {'Content-Type': 'application/json'}
            })
            .then(res => {
                if(res.status === 200)
                    return res.json();
                else
                    throw Error(res.status);
            })
            .then(json => {
                checkSeedGenerationStatus(json.id, interaction, userinfo.username, ctime, presetname, RSLMETADATA);
            })
            .catch(error => {
                console.log(`[${ctime}] ${error}`);
            })
        }
    })
    proc.chdir('..');
}


function checkSeedGenerationStatus(seedId, interaction, username, currentTime, presetName, RSLMETADATA) {
    const statusCheckInterval = setInterval(() => {
        fetch(`https://ootrandomizer.com/api/v2/seed/status?key=${process.env.OOTR_API_KEY}&id=${seedId}`)
        .then(res => {
            if (res.status === 200) { return res.json(); }
            else { throw Error(res.status); }
        })
        .then(res => {
            const status = res.status;
            const progress = res.progress
            if (status === 0) {
                if (res.positionQueue > 0) {
                    interaction.editReply({content: `Position in queue: ${res.positionQueue}%`})
                } else {
                    interaction.editReply({content: `Generating your seed: ${progress}%`})
                }
            } else if (status === 1) {
                clearInterval(statusCheckInterval);
                const seedUrl = `https://ootrandomizer.com/seed/get?id=${seedId}`;
                interaction.editReply({
                    content: `Here is your seed rolled with ${presetName} weights (v${RSLMETADATA.rslversion})`,
                    components: [make_seed_buttons(seedUrl, false)]
                });
                add_seed_to_log(username, currentTime, seedId);
            } else if (status === 3) {
                clearInterval(statusCheckInterval);
                interaction.editReply({
                    content: `Generation of seed ${seedId} failed. This happens sometimes with certain settings combinations.
                    Please try again. If this has happen multiple times, please dm \`xopar\` on discord or in the Ocarina
                    of Time Randomizer discord server.`
                })
                console.log(`[${currentTime}] Seed ${seedId} failed to generate`);
            }
        })
        .catch(error => {
            clearInterval(statusCheckInterval);
            console.log(`[${currentTime}] Error checking seed status: ${error}`);
        });
    }, 5000);
};


function unlock_seed(interaction) {
    const seed_url = interaction.message.components[0].components[0].data.url;
    const seedid = seed_url.split("=")[1]
    interaction.update({content: interaction.message.content, components: [make_seed_buttons(seed_url, null)] });
    
    // Unlock the log
    fetch(`https://ootrandomizer.com/api/v2/seed/unlock?key=${process.env.OOTR_API_KEY}&id=${seedid}`,
        {method: 'post', body: '', headers: {'Content-Type': 'application/json'}
    })
    .then(res => {
        // Catch errors
        if(res.status === 200) { return res.text() }
        else if(res.status === 404) { interaction.followUp({content: "Seed not found, did the seed have an error while generating?"}); throw Error(res.status); }
        else if(res.status === 204) { 
            interaction.editReply({content: interaction.message.content, components: [make_seed_buttons(seed_url, false)]});
            interaction.followUp({content: "The seed is still generating, please try again in a minute."});
            throw Error(res.status); }
        else if(res.status === 208) { interaction.followUp({content: "The log is either already unlocked or there is no log available."}); throw Error(res.status); }
        else { throw Error(res.status); }
    })
    .then(text => {
        console.log(text, `for seed ${seedid}`);
        interaction.editReply({content: interaction.message.content, components: [make_seed_buttons(seed_url, true)] });
    })
    .catch(error => {
        console.log(`${error}`)
    })
}


function check_seed_eligibility(userinfo, ctime) {
    const cooldowns_seconds = {
        "admin": 0,
        "moderator": 30,
        "organizer": 120
    }

    // Return seed roll eligibility based on user rank and the last time they rolled a seed
    const cooldown = userinfo.user_level in cooldowns_seconds ? cooldowns_seconds[userinfo.user_level] : 15 * 60;
    const eligibility = { status: true, cooldown: cooldown, remaining: null };
    if(userinfo.username in seed_log) {
        const ltime = new Date(seed_log[userinfo.username].timelist.at(-1));
        const remaining_time = cooldown * 1000 - (ctime - ltime);
        if(remaining_time > 0) {
            eligibility.status = false;
            eligibility.remaining = Math.floor(remaining_time / 1000);
        }
    }

    return eligibility;
}


function add_seed_to_log(username, ctime, id) {
    if(username in seed_log)
        seed_log[username] = {
            idlist: seed_log[username].idlist.concat(id),
            timelist: seed_log[username].timelist.concat(ctime),
            nseeds: seed_log[username].nseeds+1
        };
    else
        seed_log[username] = {
            idlist: [id],
            timelist: [ctime],
            nseeds: 1
        };
    fs.writeFileSync(seed_log_path, JSON.stringify(seed_log, null, 4));   
}


module.exports = { roll_seed, unlock_seed };
