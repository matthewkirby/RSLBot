# RSLBot
A simple discord bot to roll Random Settings League seeds for Ocarina of Time Randomizer.

To run locally:
1. Set up a discord bot account (instructions elsewhere)
2. Clone this repository.
3. Clone the [RSL Script repository](https://github.com/matthewkirby/plando-random-settings) into the main RSLBot directory.
4. Write a file called `.env` in the main directory that includes 3 secret environment variables, `CLIENT_ID`, `OOTR_API_KEY`, `CLIENT_TOKEN`. These keys are private, do not commit them to a repository or otherwise reveal them.
5. Run the bot with `node index.js` or via pm2 with `pm2 start pm2.config.js`.