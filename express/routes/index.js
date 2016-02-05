var AV = require('avoscloud-sdk');

// AV Objects
var Player = AV.Object.extend('Player');
var Room = AV.Object.extend('Room');


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
            playerQueryObj = new AV.Query('Player');

        playerQueryObj.get(userId).try(function(player) {
            if(userName !== undefined) player.set('userName', userName);
            if(userStatus !== undefined) player.set('userStatus', userStatus);
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
        var playerQueryObj = new AV.Query('Player');

        playerQueryObj.addAscending('updatedAt');
        playerQueryObj.equalTo('userStatus', 'JOINED');

        playerQueryObj.find().then(function(results) {
            res.send({
                statusCode: 0,
                message: '',
                userList: results
            });
        }, function(error) {
            res.send({
                statusCode: 1,
                message: 'user list error',
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
        var roomQueryObj = new AV.Query('Room'),
            roomId = req.body.roomId,
            playerId = req.body.userId;

        roomQueryObj.get(roomId).then(function(room) {

            // check by room status, only WAITING can be joined
            if(room.get('status') !== 'WAITING') {
                res.send({
                    statusCode: 1,
                    message: 'room is not waiting, cannot join',
                    room: room
                });
                return;
            }

            // check for room size
            if(room.get('players').length === room.get('roomSize')) {
                res.send({
                    statusCode: 1,
                    message: 'room is full, cannot join',
                    room: room
                });
                return;
            }

            // add playerId into room.players array
            if(room.get('players').indexOf(playerId) === -1) {
                room.get('players').push(playerId);
            }


            room.save().then(function(response) {
                res.send({
                    statusCode: 0,
                    message: '',
                    room: response
                });
            }, function(error) {
                res.send({
                    statusCode: 1,
                    message: 'update room players error',
                    error: error
                });
            });

        }, function(error) {
            res.send({
                statusCode: 1,
                message: 'cannot find room by id ' + roomId,
                error: error
            });
        });
    });

    router.post('/game/user/leaveRoom', function(req, res) {
        var roomQueryObj = new AV.Query('Room'),
            roomId = req.body.roomId,
            userId = req.body.userId;

        roomQueryObj.get(roomId).then(function(room) {
            room.set('players',
                room.get('players').filter(function(playerId) {
                    return playerId !== userId;
                })
            );

            if(room.get('players').length === 0)
                room.status = 'CLOSED';

            room.save().then(function(response) {
                res.send({
                    statusCode: 0,
                    message: '',
                    room: response
                });
            }, function(error) {
                res.send({
                    statusCode: 1,
                    message: 'update room players error',
                    error: error
                });
            });

        }, function(error) {
            res.send({
                statusCode: 1,
                message: 'cannot find room by id ' + roomId,
                error: error
            });
        });
    });

    router.post('/game/room/create', function(req, res) {
        var roomAVObj = new Room(),
            room = {
                roomName: req.body.roomName,
                roomDescription : req.body.roomDescription,
                roomSize: Number.parseInt(req.body.roomSize, 10),
                players: [],
                status: 'WAITING',
                creator: req.body.creator
            };

        roomAVObj.save(room).then(function(response) {

            io.emit('room-create', response);

            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: 1,
                message: 'create room error',
                error: error
            });
        });
    });


    router.post('/game/room/update', function(req, res) {
        var roomQueryObj = new AV.Query('Room'),
            roomId = req.body.roomId;

        roomQueryObj.get(roomId).try(function(room) {
            if(room.get('status') !== 'WAITING') {
                AV.Promise.error('cannot update room while status is "WAITING"');
            } else {
                room.set('roomName', req.body.roomName);
                room.set('roomDescription', req.body.roomDescription);
                room.set('roomSize', Number.parseInt(req.body.roomSize, 10));
                return room.save();
            }
        }).try(function(room) {
            res.send({
                statusCode: 0,
                message: '',
                room: room
            });
        }).catch(function(error) {
            res.send({
                statusCode: 1,
                message: 'room update failed',
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

    router.post('/game/room/listPlayers', function(req, res) {});

    router.post('/game/rankings', function(req, res) {});
    router.post('/game/controls', function(req, res) {
        var roomQueryObj = new AV.Query('Room'),
            roomId = req.body.roomId,
            control = req.body.control;

        roomQueryObj.get(roomId).then(function(room) {
            if(control === 'START')
                room.status = 'PLAYING';
            if(control === 'STOP')
                room.status = 'WAITING';

            room.save().then(function(response) {
                res.send({
                    statusCode: 0,
                    message: '',
                    room: response
                });
            }, function(error) {
                res.send({
                    statusCode: 1,
                    message: 'cannot save room',
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
};
