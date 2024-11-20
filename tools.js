const { metadata } = require("./metadata.js");


function isInteractionUserAdmin(interaction) {
    const userInfo = parse_user_info(interaction, "INTERACTION");
    return userInfo.user_level === "admin";
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

module.exports = { isInteractionUserAdmin, parse_user_info };