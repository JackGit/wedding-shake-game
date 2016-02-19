var AV = require('avoscloud-sdk');
var PlayerDAO = require('../dao/player.js');
var RoomDAO = require('../dao/room.js');

module.exports = function(app, io) {
    var router = app;

    router.post('/game/user/create', function(req, res) {
        var player = {
            userName: req.body.userName,
            userType: req.body.userType,
            shakeCount: 0
        };

        PlayerDAO.createPlayer(player).then(function(response) {
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
        PlayerDAO.updatePlayer(req.body.user).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                user: response
            });
        }, function(error) {
            res.send({
                statusCode: 1,
                message: 'update user error',
                error: error
            });
        });
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
        PlayerDAO.getPlayer(req.body.userId).then(function(response) {
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

    router.post('/game/room/delete', function(req, res) {
        RoomDAO.deleteRoom(req.body.roomId).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'delete room error',
                error: error
            });
        });
    });

    router.post('/game/room/list', function(req, res) {
        RoomDAO.listRoom().then(function(results) {
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
        RoomDAO.getRoom(req.body.roomId).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'get room error',
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
