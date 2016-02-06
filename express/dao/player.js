var AV = require('avoscloud-sdk');
var Player = AV.Object.extend('Player');
var PLAYER_PROPERTIES = {
    playerName: '',
    playerType: '',
    shakeCount: 0               // this shakeCount will be used to record playing data. When game is stopped, this data will be synced to room.ranking
};

var playerDAO = {
    createPlayer: function(player) {
        var playerAVObj = new Player(),
            p;

        for(p in PLAYER_PROPERTIES)
            if(player[p] !== undefined)
                playerAVObj.set(p, player[p]);

        return playerAVObj.save();
    },
    getPlayer: function(playerId) {
        var playerQueryObj = new AV.Query('Player');
        return playerQueryObj.get(playerId);
    },
    updatePlayer: function(player) {
        return playerDAO.getPlayer(player.objectId).try(function(playerAVObj) {
            for(var p in PLAYER_PROPERTIES)
                if(player[p] !== undefined)
                    playerAVObj.set(p, player[p]);

            return playerAVObj.save();
        });
    },
    getPlayerList: function(playerIds) {
        var playerQueryObj = new AV.Query('Player');
        playerQueryObj.containedIn('objectId', playerIds);
        return playerQueryObj.find();
    }
};

module.exports = playerDAO;