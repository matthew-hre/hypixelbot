const hypixel = require('hypixel-api-nodejs');
const hypixelKey = "25f0afdd-eefc-4bb6-b839-29383ed72c82";

module.exports = {
  name: 'bedwars',
  description: 'shows the number of beds broken',
  execute(msg, args) {
    hypixel.getPlayerByName(hypixelKey, args[0]).then(player => {
      msg.channel.send(player.player.playername + ' has destroyed ' + player.player.achievements.bedwars_beds + ' beds!');
    });
  },
};
