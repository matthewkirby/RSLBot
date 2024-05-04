const fs = require("fs");

// Load some metadata from the RSL script
let rslVersion = null;
let ootrVersion = null;
const rslPath = 'plando-random-settings/rslversion.py';
if(fs.existsSync(rslPath)) {
    versionBody = fs.readFileSync(rslPath, 'utf8');
    rslVersion = versionBody.split('\n')[0].split('=')[1].trim().slice(1,-1);
    ootrVersion = versionBody.split('\n')[4].split('=')[1].trim().split(' Rob').join('').replaceAll("'", "");
} else {
    throw new Error("RSL Script must be cloned in the bot directory.");
}

const metadata = {
    season: 6,
    rslVersion: rslVersion,
    ootrVersion: ootrVersion,
    admin: ["xopar#0"],
    // These are the RSL organizers
    moderator: [".cola#0", "cubsrule21#0", "emosoda#0", "kirox#0", "slyryd#0", "timmy2405#0", "trenter_tr#0"],
    organizer: []
};


module.exports = { metadata };
