var AV = require('avoscloud-sdk');
var Player = AV.Object.extend('Player');
var PLAYER_PROPERTIES = {
    userName: '',
    userType: '',
    shakeCount: 0,                  // this shakeCount will be used to record playing data. When game is stopped, this data will be synced to room.ranking
    status: '',                     // JOINED, LEFT, ''
    roomId: '',
    joinedAt: null,
    leftAt: null,
    avatarImageUrl: 'static/images/default_user_avatar.png',
    qqOpenId: '',
    qqAccessToken: '',
    qqRefreshAccessToken: '',
    expiresIn: '0'
};

var playerDAO = {
    createPlayer: function(player) {
        var playerAVObj = new Player(),
            p;

        for(p in PLAYER_PROPERTIES)
            if(player[p] !== undefined)
                playerAVObj.set(p, player[p]);
            else if(PLAYER_PROPERTIES[p] !== null)
                playerAVObj.set(p, PLAYER_PROPERTIES[p]);

        return playerAVObj.save();
    },
    saveQQUser: function(player) {
        var playerQueryObj = new AV.Query('Player');
        playerQueryObj.equalTo('qqOpenId', player.qqOpenId);

        return playerQueryObj.find().then(function(results) {
            if(results.length === 0) {
                console.log('PlayerDAO.saveQQPlayer -- create one');
                return playerDAO.createPlayer(player);
            } else {
                console.log('PlayerDAO.saveQQPlayer -- update one', results[0].id);
                player.objectId = results[0].id;
                return playerDAO.updatePlayer(player);
            }
        });
    },
    getPlayer: function(userId) {
        var playerQueryObj = new AV.Query('Player');
        return playerQueryObj.get(userId);
    },
    updatePlayer: function(player) {
        return playerDAO.getPlayer(player.objectId).try(function(playerAVObj) {
            for(var p in PLAYER_PROPERTIES)
                if(player[p] !== undefined)
                    playerAVObj.set(p, player[p]);

            return playerAVObj.save();
        });
    },
    getPlayerList: function(userIds) {
        var playerQueryObj = new AV.Query('Player');
        playerQueryObj.containedIn('objectId', userIds);
        return playerQueryObj.find();
    },
    getJoinedRoomPlayerList: function(roomId) {
        var playerQueryObj = new AV.Query('Player');
        playerQueryObj.equalTo('roomId', roomId);
        playerQueryObj.equalTo('status', 'JOINED');
        return playerQueryObj.find();
    },
    clearJoinStatus: function(roomId) {
        var playerQueryObj = new AV.Query('Player');
        playerQueryObj.equalTo('roomId', roomId);
        playerQueryObj.equalTo('status', 'JOINED');
        return playerQueryObj.find().try(function(results) {
            results.forEach(function(playerAVObj) {
                playerAVObj.set('status', 'LEFT');
                playerAVObj.save();
            });
        });
    }
};

module.exports = playerDAO;