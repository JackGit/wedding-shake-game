var AV = require('avoscloud-sdk');
var playerDAO = require('./player.js');
var Room = AV.Object.extend('Room');
var ROOM_PROPERTIES = {
    roomName: 'default room name',
    roomDescription: 'default room description',
    roomSize: 5,        // 5 for each side of players (GROOM and BRIDE)
    roomColor: '',      // #ffffff
    status: 'INIT',
    players: [],     // array of {playerId: '', playerType: 'GROOM'}
    ranking: []         // array of {playerId: '', shakeCount: XX}
};

/**
 * room status:
 *      created:                INIT
 *      allow player to join:   JOINING
 *      start game:             PLAYING
 *      game end:               END
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
            else
                roomAVObj.set(p, ROOM_PROPERTIES[p]);

        if(allowJoin)
            room.status = 'JOINING';

        return roomAVObj.save();
    },
    deleteRoom: function(roomId) {
        var roomQueryObj = new AV.Query('Room');
        return roomQueryObj.get(roomId).destroyAll();
    },
    updateRoom: function(room) {
        var p;

        return roomDAO.getRoom(room.roomId).try(function(roomAVObj) {
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
    listRoom: function() {
        var roomQueryObj = new AV.Query('Room');
        roomQueryObj.addAscending('createAt');
        return roomQueryObj.find();
    },
    joinRoom: function(roomId, playerId, playerType) {
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var playerList = roomAVObj.get('players'),
                status = roomAVObj.get('status'),
                roomSize = roomAVObj.get('roomSize');

            // check for status
            if(status !== 'JOINING')
                return AV.Promise.error('wrong room status, cannot join');

            // check for size
            if(playerList.filter(function(p) { return p.playerType === playerType; }).length === roomSize)
                return AV.Promise.error(playerType + ' players is full, cannot join');

            // check for duplicate join
            if(playerList.filter(function(p) { return p.playerId === playerId; }).length === 0)
                playerList.push({
                    playerId: playerId,
                    playerType: playerType,
                    joinedAt: new Date()
                });

            roomAVObj.set('players', playerList);

            return roomAVObj.save();
        });
    },
    leaveRoom: function(roomId, playerId) {
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var playerList = roomAVObj.get('players');

            playerList = playerList.filter(function(p) {
                return p.playerId !== playerId;
            });

            roomAVObj.set('players', playerList);
            return roomAVObj.save();
        });
    },
    getRoomPlayerList: function(roomId) {
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var userIds = roomAVObj.get('players').map(function(p) {
                return p.playerId;
            });
            return playerDAO.getPlayerList(userIds);
        });
    },
    getRoomRankingPlayerList: function(roomId) {
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var userIds = roomAVObj.get('ranking').map(function(r) {
                return r.playerId;
            });
            return playerDAO.getPlayerList(userIds);
        });
    },
    allowPlayerJoin: function(roomId) {
        var room = {
            roomId: roomId,
            status: 'JOINING'
        };
        return roomDAO.updateRoom(room);
    },
    startGame: function(roomId) {
        var room = {
            roomId: roomId,
            status: 'PLAYING',
            ranking: []
        };

        console.log('startGame');
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var playerList = roomAVObj.get('players'),
                ranking = [];

            console.log('startGame players', playerList);
            // init ranking object
            playerList.forEach(function(player) {
                ranking.push({
                    playerId: player.playerId,
                    playerType: player.playerType,
                    shakeCount: 0
                });
            });

            room.ranking = ranking;
            return roomDAO.updateRoom(room);
        });
    },
    stopGame: function(roomId) {
        var room = {
            roomId: roomId,
            status: 'END',
            ranking: []
        };

        // sync shakeCount from player records
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var ranking = roomAVObj.get('ranking'),
                playerList = roomAVObj.get('players'),

                // for players who are not left game when the game ended
                /* playerIds = ranking.filter(function(r) {
                    return playerList.filter(function(p) { return p.playerId === r.playerId; }).length > 0;
                }).map(function(r) {
                    return r.playerId;
                }); */

                playerIds = ranking.map(function(r) { return r.playerId; });

            return playerDAO.getPlayerList(playerIds).try(function(results) {
                results.forEach(function(playerAVObj) {
                    room.ranking.push({
                        playerId: playerAVObj.id,
                        playerType: playerAVObj.get('userType'),
                        shakeCount: playerAVObj.get('shakeCount')
                    });
                    // clear the shakeCount of each player record
                    playerAVObj.set('shakeCount', 0);
                    playerAVObj.save();
                });
                return roomDAO.updateRoom(room);
            });
        });
    }
};

module.exports = roomDAO;