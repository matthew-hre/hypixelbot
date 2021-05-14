require('dotenv').config();
const hypixel = require('hypixel-api-nodejs');
const hypixelKey = "25f0afdd-eefc-4bb6-b839-29383ed72c82"; // this token i don't care about, regenerated already
let fs = require('fs');
let request = require('request');
const rp = require('request-promise');
let recent = fs.readFileSync('./transaction.txt', 'utf-8');
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN; // .env not included in the project for obvious reasons

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`logged in as ${bot.user.tag}!`);
  setInterval(getBanking, 5000); // really inefficient, don't care at all
});

bot.on('message', msg => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();
  console.info(`Called command: ${command}`);

  if (!bot.commands.has(command)) return;

  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});

function getBanking() {
  let uuid;
  let apiUrl;
  hypixel.getPlayerByName(hypixelKey, "whycardboard").then(player => {
    uuid = player.player.uuid;
    apiUrl = "https://api.hypixel.net/skyblock/profiles?key=" + hypixelKey + "&uuid=" + uuid;

    return rp(apiUrl).then(body => {
      let responseData = JSON.parse(body);
      let transactions = responseData.profiles[0].banking.transactions;
      let lastTransaction = transactions[transactions.length-1];
      if(!this.recent || lastTransaction.timestamp > this.recent) {
        this.recent = lastTransaction.timestamp;

        console.log(this.recent);
        fs.writeFileSync('./transaction.txt', this.recent, 'utf-8');

        
        // big number = discord channel id
        bot.channels.get("635216519852458040").send(({embed: {
            color: 3447003,
            title: "hypixel banking update!",
            description: "someone just accessed the bank account!",
            fields: [{
              name: "user",
              value: lastTransaction.initiator_name.replace("§a", ""),
              inline: true
            },
            {
              name: "action",
              value: lastTransaction.action.toLowerCase(),
              inline: true
            },
            {
              name: "amount",
              value: (Math.round(lastTransaction.amount * 10)/10).toString() + " coins",
              inline: true
            }
            ],
            timestamp: new Date(),
          }
        }));
      }
    });
  });
}

