module.exports = {
  apps : [{
    name         : "RSLBot",
    script       : "./index.js",
    watch        : true,
    ignore_watch : ["plando-random-settings", "data/seed_log.json"]
  }]
}