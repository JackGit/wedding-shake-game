var AV = require('avoscloud-sdk');
var playerDAO = require('./player.js');
var Room = AV.Object.extend('Room');
var ROOM_PROPERTIES = {
    roomName: 'default room name',
    roomDescription: 'default room description',
    roomSize: 5,        // 5 for each side of players (GROOM and BRIDE)
    status: 'INIT',
    playerList: [],     // array of {playerId: '', playerType: 'GROOM'}
    ranking: []         // array of {playerId: '', shakeCount: XX}
};

/**
 * room status:
 *      created: INIT
 *      allow player to join: JOINING
 *      start game: PLAYING
 *      game end: END
 *
 * note: it should create a new room record to start another round of game. So END is the end state of room.
 *      and each room record is a snapshot of a round of game.
 */

var roomDAO = {
    createRoom: function(room, allowJoin) {
        var roomAVObj = new Room(),
            p;

        for(p in ROOM_PROPERTIES)
            if(room[p] !== undefined)
                roomAVObj.set(p, room[p]);

        if(allowJoin)
            room.status = 'JOINING';

        return roomAVObj.save();
    },
    updateRoom: function(room) {
        var p;

        return roomDAO.getRoom(room.objectId).try(function(roomAVObj) {
            for(p in ROOM_PROPERTIES)
                if(room[p] !== undefined)
                    roomAVObj.set(p, room[p]);

            return roomAVObj.save();
        });
    },
    getRoom: function(roomId) {
        var roomQueryObj = new AV.Query('Room');
        return roomQueryObj.get(roomId);
    },
    joinRoom: function(roomId, playerId, playerType) {
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var playerList = roomAVObj.get('playerList'),
                status = roomAVObj.get('status'),
                roomSize = roomAVObj.get('roomSize');

            // check for status
            if(status !== 'JOINING')
                return AV.Promise.error('wrong room status, cannot join');

            // check for size
            if(playerList.filter(function(p) { return p.playerType === playerType; }).length === roomSize)
                return AV.Promise.error(playerType + ' players is full, cannot join');

            // check for duplicate join
            if(playerList.indexOf(playerId) === -1)
                playerList.push({
                    playerId: playerId,
                    playerType: playerType
                });

            roomAVObj.set('playerList', playerList);

            return roomAVObj.save();
        });
    },
    leaveRoom: function(roomId, playerId) {
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var playerList = roomAVObj.get('playerList');

            playerList = playerList.filter(function(p) {
                return p.playerId !== playerId;
            });

            roomAVObj.set('playerList', playerList);
            return roomAVObj.save();
        });
    },
    getRoomPlayerList: function(roomId) {
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            return playerDAO.getPlayerList(roomAVObj.get('playerList'));
        });
    },
    allowPlayerJoin: function(roomId) {
        var room = {
            objectId: roomId,
            status: 'JOINING'
        };
        return roomDAO.updateRoom(room);
    },
    startGame: function(roomId) {
        var room = {
            objectId: roomId,
            status: 'PLAYING',
            ranking: []
        };

        return roomDAO.get(roomId).try(function(roomAVObj) {
            var playerList = roomAVObj.get('playerList'),
                ranking = [];

            // init ranking object
            playerList.forEach(function(playerId) {
                ranking.push({
                    playerId: playerId,
                    shakeCount: 0
                });
            });

            room.ranking = ranking;
            return roomDAO.updateRoom(room);
        });
    },
    stopGame: function(roomId) {
        var room = {
            objectId: roomId,
            status: 'END',
            ranking: []
        };

        // sync shakeCount from player records
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var ranking = roomAVObj.get('ranking'),
                playerList = roomAVObj.get('playerList'),

                // for players who are not left game when the game ended
                playerIds = ranking.filter(function(r) {
                    return playerList.indexOf(r.playerId) !== -1;
                }).map(function(r) {
                    return r.playerId;
                });

            return playerDAO.getPlayerList(playerIds).try(function(results) {
                results.forEach(function(playerAVObj) {
                    room.ranking.push({
                        playerId: playerAVObj.get('objectId'),
                        shakeCount: playerAVObj.get('shakeCount')
                    });
                    // clear the shakeCount of each player record
                    playerAVObj.set('shakeCount', 0);
                    playerAVObj.save();
                });
                return roomDAO.updateRoom(room)
            });
        });
    }
};

module.exports = roomDAO;