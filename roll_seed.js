const {PythonShell} = require('python-shell');
const proc = require('process');
const fetch = require('node-fetch');
const fs = require('fs');
const tools = require("./bot_tools.js");
const { SystemChannelFlags } = require('discord.js');

const power_users = ["Xopar#0958"];
const preset_list = {
    'beginner': '--override=beginner_override.json',
    'intermediate': '--override=intermediate_override.json',
    'ddr': '--override=ddr_override.json',
    'xopar': '--override=xopar.json'
}
 
 // Load the seed log
let seed_log = null;
const seed_log_path = 'data/seed_log.json';
if(fs.existsSync(seed_log_path)) {
    seed_log = JSON.parse(fs.readFileSync(seed_log_path));
    tools.record_log("Successfully loaded the seed log");
} else {
    seed_log = {};
    fs.writeFileSync(seed_log_path, JSON.stringify(seed_log, null, 4));
    tools.record_log("Generated empty seed log");
}

 
function roll_seed(msg, user, ctime) {
    // Test if the user has requested too many seeds
    if(!check_seed_eligibility(user, ctime)) {
        msg.author.send("You are trying to roll seeds too fast! Please give me at least 15 minutes to relax between seeds.");
        tools.record_log(`[${ctime}] ${user} tried to roll another seed too fast.`);
        return;
    }

    // Parse for presets
    let preset = null;
    if(msg.content.trim().split(' ').length > 1) {
        const cpreset = msg.content.trim().split(' ').at(1);
        if(cpreset in preset_list) {
            msg.author.send(`Using the ${cpreset} preset...`);
            preset = preset_list[cpreset];
        } else {
            console.log(`${cpreset} is not a valid preset. You can see a summary of all valid presets by saying \`!preset\`.`)
            return;
        }
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
            fetch(`https://ootrandomizer.com/api/v2/seed/create?key=${process.env.OOTR_API_KEY}&version=devRSL_6.2.29&locked`, {
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
                const seed_url = `https://ootrandomizer.com/seed/get?id=${json.id}`;
                msg.author.send(`Please don't hate me D= ${seed_url}`);
                add_seed_to_log(user, ctime, json.id);
                tools.record_log(`[${ctime}] Rolled a seed for ${user} at ${seed_url}`);
            })
            .catch(error => {
                console.log(`[${ctime}] ${error}`);
            })
        }
    })
    proc.chdir('..');
}

function unlock_seed(msg, user, ctime) {
    // Unlock a seed that has been generated. An ID can be given by a power user to unlock a specific seed

    // Find the seed to unlock
    let seedid = null;
    if(user in seed_log) { seedid = seed_log[user].idlist.at(-1); }
    else { msg.author.send("You need to generate a seed before you can unlock one!"); return; }

    // Unlock the log
    fetch(`https://ootrandomizer.com/api/v2/seed/unlock?key=${process.env.OOTR_API_KEY}&id=${seedid}`,
        {method: 'post', body: '', headers: {'Content-Type': 'application/json'}
    })
    .then(res => {
        if(res.status === 200) { return res.text() }
        else if(res.status === 404) { msg.author.send("Last seed not found, did the seed have an error while generating?"); throw Error(res.status); }
        else if(res.status === 204) { msg.author.send("The seed is still generating, please try again in a minute."); throw Error(res.status); }
        else if(res.status === 208) { msg.author.send("The log is either already unlocked or there is no log available."); throw Error(res.status); }
        else { throw Error(res.status); }
    })
    .then(text => {
        console.log(text, `for seed ${seedid}`);
        msg.author.send(`I just unlocked the log for seed ${seedid}.`)
    })
    .catch(error => {
        console.log(`${error}`)
    })
}

function check_seed_eligibility(user, ctime) {
    // Only roll a seed if its been at least 15 mins since the last seed they rolled.
    if(user in seed_log) {
        const ltime = new Date(seed_log[user].timelist.at(-1));
        if((ctime - ltime > 15 * 60 * 1000) || power_users.includes(user))
            return true;
    }
    else
        return true;
    return false;
}

function add_seed_to_log(user, ctime, id) {
    if(user in seed_log)
        seed_log[user] = { idlist: seed_log[user].idlist.concat(id), timelist: seed_log[user].timelist.concat(ctime), nseeds: seed_log[user].nseeds+1 };
    else
        seed_log[user] = { idlist: [id], timelist: [ctime], nseeds: 1 };
    fs.writeFileSync(seed_log_path, JSON.stringify(seed_log, null, 4));   
}

module.exports = { roll_seed, unlock_seed };
