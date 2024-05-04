const { PythonShell } = require('python-shell');
const proc = require('process');
const fetch = require('node-fetch');
const fs = require('fs');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { metadata } = require("./metadata.js");


const presetList = {
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

function makeSeedButtons(seedUrl, unlocked) {
    const seedButton = new ButtonBuilder()
        .setURL(seedUrl)
        .setLabel("Download Seed")
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder()
        .addComponents(seedButton);
    if(unlocked === null) { /* pass */ }
    else if(unlocked) { row.addComponents(logUnlockedButton); }
    else { row.addComponents(unlockLogButton); }
    return row;
}


 // Load the seed log
let seedLog = null;
const seedLogPath = 'data/seed_log.json';
if(fs.existsSync(seedLogPath)) {
    seedLog = JSON.parse(fs.readFileSync(seedLogPath));
} else {
    seedLog = {};
    fs.writeFileSync(seedLogPath, JSON.stringify(seedLog, null, 4));
}


function rollSeed(interaction, userinfo, currentTime) {
    // Test if the user has requested too many seeds
    const eligibility = checkSeedEligibility(userinfo, currentTime);
    if(!eligibility.status) {
        interaction.update({
            content: `Please wait at least ${eligibility.cooldown / 60} minutes between seeds. You have ${eligibility.remaining} seconds remaining.`,
            components: []
        });
        return;
    }

    // Parse the preset and update message
    let preset = null;
    const presetName = interaction.customId.split("roll_")[1];
    if(presetName in presetList) {
        interaction.update({content: `Rolling a seed with ${presetName} weights`, components: [] });
        preset = presetList[presetName];
    } else {
        interaction.update({content: `Rolling a seed with Season ${metadata.season} weights`, components: [] });
    }

    // Roll the seed
    proc.chdir('plando-random-settings')
    const pythonRSLArgs = preset === null ? ['--no_seed'] : ['--no_seed', preset];
    const pythonOptions = { pythonPath: '/usr/bin/python3.9', args: pythonRSLArgs };
    PythonShell.run("RandomSettingsGenerator.py", pythonOptions, (error, results) => {
        if(error) throw error;
        if(results.at(-1).startsWith('Plando File')) {
            const plandoPath = 'plando-random-settings/data/' + results.at(-1).split(':').at(-1).trim();
            const settings = JSON.parse(fs.readFileSync(plandoPath)).settings;
            settings.world_count = 1;
            settings.create_spoiler = true;
            settings.randomize_settings = false;
        
            // Make the POST request to roll the seed
            fetch(`https://ootrandomizer.com/api/v2/seed/create?key=${process.env.OOTR_API_KEY}&version=devRSL_${metadata.ootrVersion}&locked`, {
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
                checkSeedGenerationStatus(json.id, interaction, userinfo.username, currentTime, presetName);
            })
            .catch(error => {
                console.log(`[${currentTime}] ${error}`);
            })
        }
    })
    proc.chdir('..');
}


function checkSeedGenerationStatus(seedId, interaction, username, currentTime, presetName) {
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
                    content: `Here is your seed rolled with ${presetName} weights (v${metadata.rslVersion})`,
                    components: [makeSeedButtons(seedUrl, false)]
                });
                addSeedToLog(username, currentTime, seedId);
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


function unlockSeed(interaction) {
    const seedUrl = interaction.message.components[0].components[0].data.url;
    const seedId = seedUrl.split("=")[1]
    interaction.update({content: interaction.message.content, components: [makeSeedButtons(seedUrl, null)] })
    .then(() => {
        // Unlock the log
        return fetch(`https://ootrandomizer.com/api/v2/seed/unlock?key=${process.env.OOTR_API_KEY}&id=${seedId}`,
            {method: 'post', body: '', headers: {'Content-Type': 'application/json'}
        });

    })
    .then(res => {
        // Catch errors
        if(res.status === 200) { return res.text() }
        else if(res.status === 404) { interaction.followUp({content: "Seed not found, did the seed have an error while generating?"}); throw Error(res.status); }
        else if(res.status === 204) { 
            interaction.editReply({content: interaction.message.content, components: [makeSeedButtons(seedUrl, false)]});
            interaction.followUp({content: "The seed is still generating, please try again in a minute."});
            throw Error(res.status); }
        else if(res.status === 208) { interaction.followUp({content: "The log is either already unlocked or there is no log available."}); throw Error(res.status); }
        else { throw Error(res.status); }
    })
    .then(text => {
        console.log(text, `for seed ${seedId}`);
        interaction.editReply({content: interaction.message.content, components: [makeSeedButtons(seedUrl, true)] });
    })
    .catch(error => {
        console.log(`${error}`)
    })
}


function checkSeedEligibility(userInfo, currentTime) {
    const cooldownSeconds = {
        "admin": 0,
        "moderator": 30,
        "organizer": 120
    }

    // Return seed roll eligibility based on user rank and the last time they rolled a seed
    const cooldown = userInfo.user_level in cooldownSeconds ? cooldownSeconds[userInfo.user_level] : 15 * 60;
    const eligibility = { status: true, cooldown: cooldown, remaining: null };
    if(userInfo.username in seedLog) {
        const ltime = new Date(seedLog[userInfo.username].timelist.at(-1));
        const remainingTime = cooldown * 1000 - (currentTime - ltime);
        if(remainingTime > 0) {
            eligibility.status = false;
            eligibility.remaining = Math.floor(remainingTime / 1000);
        }
    }

    return eligibility;
}


function addSeedToLog(username, currentTime, seedId) {
    if(username in seedLog)
        seedLog[username] = {
            idlist: seedLog[username].idlist.concat(seedId),
            timelist: seedLog[username].timelist.concat(currentTime),
            nseeds: seedLog[username].nseeds+1
        };
    else
        seedLog[username] = {
            idlist: [seedId],
            timelist: [currentTime],
            nseeds: 1
        };
    fs.writeFileSync(seedLogPath, JSON.stringify(seedLog, null, 4));
}


module.exports = { rollSeed, unlockSeed };
