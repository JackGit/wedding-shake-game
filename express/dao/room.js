var AV = require('avoscloud-sdk');
var playerDAO = require('./player.js');
var Room = AV.Object.extend('Room');
var ROOM_PROPERTIES = {
    roomName: 'default room name',
    roomDescription: 'default room description',
    roomSize: 5,        // 5 for each side of players (GROOM and BRIDE)
    roomColor: '',      // #ffffff
    status: 'INIT',
    //players: [],     // array of {playerId: '', playerType: 'GROOM'}
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
        return roomQueryObj.get(roomId).then(function(roomAVObj) {
            return roomAVObj.destroy();
        });
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
        roomQueryObj.addAscending('createdAt');
        return roomQueryObj.find();
    },
    joinRoom: function(roomId, playerId, playerType) {
        return roomDAO.getRoom(roomId).try(function(roomAVObj) {
            var status = roomAVObj.get('status');

            // check for status
            if(status !== 'JOINING')
                return AV.Promise.error('wrong room status, cannot join');

            // check for size

            return playerDAO.updatePlayer({
                objectId: playerId,
                shakeCount: 0,
                status: 'JOINED',
                roomId: roomId,
                joinedAt: new Date()
            });
        });
    },
    leaveRoom: function(roomId, playerId) {
        return playerDAO.updatePlayer({
            objectId: playerId,
            status: 'LEFT',
            leftAt: new Date
        });
    },
    getRoomPlayerList: function(roomId) {
        return playerDAO.getJoinedRoomPlayerList(roomId);
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
            status: 'JOINING',
            //players: [],
            ranking: []
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

            return playerDAO.getJoinedRoomPlayerList(roomId).try(function(playerList) {
                var ranking = [];
                // init ranking object
                playerList.forEach(function(player) {
                    ranking.push({
                        playerId: player.id,
                        playerType: player.get('userType'),
                        shakeCount: 0
                    });
                });

                room.ranking = ranking;
                return roomDAO.updateRoom(room);
            });
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

                playerDAO.clearJoinStatus(roomId);

                // descend order by shakeCount
                room.ranking = room.ranking.sort(function(p1, p2) {
                    return p2.shakeCount - p1.shakeCount;
                });

                return roomDAO.updateRoom(room);
            });
        });
    }
};

module.exports = roomDAO;