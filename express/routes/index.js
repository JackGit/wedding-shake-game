var AV = require('avoscloud-sdk');
var PlayerDAO = require('../dao/player.js');
var RoomDAO = require('../dao/room.js');

// AV Objects
var Player = AV.Object.extend('Player');
var Room = AV.Object.extend('Room');
var Game = AV.Object.extend('Game');

module.exports = function(app, io) {
    var router = app;

    router.post('/game/user/create', function(req, res) {
        var playerAVObj = new Player(),
            player = {
                userName: req.body.userName,
                userType: req.body.userType,
                userStatus: 'JOINED',
                shakeCount: 0
            };

        playerAVObj.save(player).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                user: response
            });
        }, function(error) {
            res.send({
                statusCode: 1,
                message: 'create use error',
                error: error
            });
        });
    });

    router.post('/game/user/update', function(req, res) {
        var userId = req.body.userId,
            userName = req.body.userName,
            userStatus = req.body.userStatus,
            shakeCount = req.body.shakeCount,
            playerQueryObj = new AV.Query('Player');

        playerQueryObj.get(userId).try(function(player) {
            if(userName !== undefined) player.set('userName', userName);
            if(userStatus !== undefined) player.set('userStatus', userStatus);
            if(shakeCount !== undefined) player.set('shakeCount', shakeCount);
            return player.save();
        }).try(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                user: response
            });
        }).catch(function(error) {
            res.send({
                statusCode: 1,
                message: 'update user error',
                error: error
            })
        })
    });

    router.post('/game/user/delete', function(req, res) {});
    router.post('/game/user/list', function(req, res) {
        PlayerDAO.getPlayerList(req.body.userId).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                users: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: '',
                error: error
            });
        });
    });

    router.post('/game/user/get', function(req, res) {
        var playerQueryObj = new AV.Query('Player'),
            id = req.body.userId;

        playerQueryObj.get(id).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                user: response
            });
        }, function(error) {
            res.send({
                statusCode: 1,
                message: 'get user error ' + id,
                error: error
            });
        });
    });

    router.post('/game/user/joinRoom', function(req, res) {
        RoomDAO.joinRoom(req.body.roomId, req.body.userId, req.body.userType).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'join room error',
                error: error
            });
        });
    });

    router.post('/game/user/leaveRoom', function(req, res) {
        RoomDAO.leaveRoom(req.body.roomId, req.body.userId).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'leave room error',
                error: error
            });
        });
    });

    router.post('/game/room/create', function(req, res) {
        var room = {
            roomName: req.body.roomName,
            roomDescription : req.body.roomDescription,
            roomSize: Number.parseInt(req.body.roomSize, 10),
            players: []
        };

        RoomDAO.createRoom(room, false).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'create room failed',
                error: error
            });
        });
    });


    router.post('/game/room/update', function(req, res) {
        var room = {
            roomId: req.body.roomId,
            roomName: req.body.roomName,
            roomDescription: req.body.roomDescription,
            roomSize: req.body.roomSize,
            status: req.body.status
        };

        RoomDAO.updateRoom(room).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'update room error',
                error: error
            });
        });
    });

    router.post('/game/room/delete', function(req, res) {});
    router.post('/game/room/list', function(req, res) {
        var roomQueryObj = new AV.Query('Room');

        roomQueryObj.addAscending('createAt');
        roomQueryObj.find().then(function(results) {
            res.send({
                statusCode: 0,
                message: '',
                roomList: results
            });
        }, function(error) {
            res.send({
                statusCode: 1,
                message: 'room list error',
                error: error
            });
        });
    });

    router.post('/game/room/get', function(req, res) {
        var roomQueryObj = new AV.Query('Room'),
            playerQueryObj = new AV.Query('Player'),
            roomId = req.body.roomId;

        roomQueryObj.get(roomId).then(function(room) {

            playerQueryObj.containedIn('objectId', room.get('players'));
            playerQueryObj.find().then(function(players) {
                res.send({
                    statusCode: 0,
                    message: '',
                    room: room,
                    players: players
                });
            }, function(error) {
                res.send({
                    statusCode: 0,
                    message: 'get room player list error',
                    error: error
                });
            });

        }, function(error) {
            res.send({
                statusCode: 1,
                message: 'cannot get room by id ' + roomId,
                error: error
            });
        });
    });

    router.post('/game/room/playerList', function(req, res) {
        RoomDAO.getRoomPlayerList(req.body.roomId).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                players: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: '',
                error: error
            });
        });
    });

    router.post('/game/rankings', function(req, res) {});
    router.post('/game/controls/start', function(req, res) {

    });
    router.post('/game/controls/stop', function(req, res) {

    });
};
