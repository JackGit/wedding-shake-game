var PlayerDAO = require('../dao/player.js');
var RoomDAO = require('../dao/room.js');
var AdminDAO = require('../dao/admin.js');
var OauthQQ = require('../oauth/connect.qq.js');

module.exports = function(app) {
    var router = app;

    router.post('/passport/qq/login', function(req, res) {
        var authroizeCode = req.body.code;
        var token = '';
        var refreshToken = '';
        var expiresIn = 0;
        var openId = '';

        OauthQQ.getAccessToken(authroizeCode).then(function(response) {
            token = response.access_token;
            refreshToken = response.refresh_token;
            expiresIn = response.expires_in;

            return OauthQQ.getOpenId(token);
        }).then(function(response) {
            openId = response.openid;
            return OauthQQ.getUserInfo(token, openId);
        }).then(function(response) {
            // "nickname": "StupidJack",
            // "gender": "��",
            // "province": "����",
            // "city": "�人",
            // "year": "1989",
            // "figureurl": "http:\/\/qzapp.qlogo.cn\/qzapp\/101295012\/C556321FC9B2E9568B24D06654A4091C\/30",
            // "figureurl_1": "http:\/\/qzapp.qlogo.cn\/qzapp\/101295012\/C556321FC9B2E9568B24D06654A4091C\/50",
            // "figureurl_2": "http:\/\/qzapp.qlogo.cn\/qzapp\/101295012\/C556321FC9B2E9568B24D06654A4091C\/100",
            // "figureurl_qq_1": "http:\/\/q.qlogo.cn\/qqapp\/101295012\/C556321FC9B2E9568B24D06654A4091C\/40",
            // "figureurl_qq_2": "http:\/\/q.qlogo.cn\/qqapp\/101295012\/C556321FC9B2E9568B24D06654A4091C\/100",
            // "is_yellow_vip": "0",
            // "vip": "0",
            // "yellow_vip_level": "0",
            // "level": "0",
            // "is_yellow_year_vip": "0"
            return PlayerDAO.saveQQUser({
                userName: response.nickname,
                avatarImageUrl: response.figureurl_qq_2 || response.figureurl_qq_1,
                qqOpenId: openId,
                qqAccessToken: token,
                qqRefreshAccessToken: refreshToken,
                expiresIn: expiresIn
            });
        }).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                user: response
            });
        }).catch(function(error) {
            res.send({
                statusCode: -1,
                message: 'login via qq failed',
                error: error
            });
        });
    });


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
                message: 'get user error',
                error: error
            });
        });
    });

    router.post('/game/user/joinRoom', function(req, res) {
        RoomDAO.joinRoom(req.body.roomId, req.body.userId, req.body.userType).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                user: response
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
                user: response
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
            roomColor: req.body.roomColor,
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
        var room = req.body.room;

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
                message: 'get room player list error',
                error: error
            });
        });
    });

    router.post('/game/room/rankingPlayerList', function(req, res) {
       RoomDAO.getRoomRankingPlayerList(req.body.roomId).then(function(response) {
           res.send({
               statusCode: 0,
               message: '',
               players: response
           });
       }, function(error) {
           res.send({
               statusCode: -1,
               message: 'get room ranking player list error',
               error: error
           });
       });
    });

    router.post('/game/controls/joining', function(req, res) {
        RoomDAO.allowPlayerJoin(req.body.roomId).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'allow join room error',
                error: error
            });
        });
    });

    router.post('/game/controls/start', function(req, res) {
        RoomDAO.startGame(req.body.roomId).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'start room error',
                error: error
            });
        });
    });

    router.post('/game/controls/stop', function(req, res) {
        RoomDAO.stopGame(req.body.roomId).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                room: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'stop room error',
                error: error
            });
        });
    });



    router.post('/game/admin/login', function(req, res) {
        AdminDAO.getUser(req.body.user).then(function(response) {
            res.send({
                statusCode: 0,
                message: '',
                user: response
            });
        }, function(error) {
            res.send({
                statusCode: -1,
                message: 'login as admin has error',
                error: error
            });
        });
    });

    router.post('/game/admin/get', function(req, res) {
       AdminDAO.getUserById(req.body.userId).then(function(response) {
           res.send({
               statusCode: 0,
               message: '',
               user: response
           });
       }, function(error) {
           res.send({
               statusCode: -1,
               message: 'get admin user error',
               error: error
           });
       });
    });
};
