var Vue = require('vue');
var Vuex = require('vuex').default;
var api = require('../api/api.js');

Vue.use(Vuex);
Vue.config.debug = true;

// socket is global var defined in main.js
function adminListenPlayerSocketMessage(type, enable) {
    console.log('listenPlayerSocketMessage', type, enable);
    if(enable) {
        switch(type) {
            case 'join':
                socket.on('join', function(userId) {
                    store.actions.adminOnJoin(userId);
                });
                break;
            case 'leave':
                socket.on('leave', function(userId) {
                    store.actions.adminOnLeave(userId);
                });
                break;
            case 'shake':
                socket.on('shake', function(message) {
                    store.actions.adminOnShake(message);
                });
                break;
            default:
                break;
        }
    } else {
        socket.off(type);
    }
}

function listenPlayerSocketMessage(type, enable) {
    console.log('listenPlayerSocketMessage', type, enable);
    if(enable) {
        switch(type) {
            case 'join':
                socket.on('join', function(userId) {
                    store.actions.onJoin(userId);
                });
                break;
            case 'leave':
                socket.on('leave', function(userId) {
                    store.actions.onLeave(userId);
                });
                break;
            case 'shake':
                socket.on('shake', function(message) {
                    store.actions.onShake(message);
                });
                break;
            case 'status-change':
                socket.on('status-change', function(message) {
                    store.actions.onStatusChange(message);
                });
                break;
            default:
                break;
        }
    } else {
        socket.off(type);
    }
}

module.exports = window.store = new Vuex.Store({
    state: {
        /* player pages states */
        player: {
            currentPlayer: localStorage.userJSON ? JSON.parse(localStorage.userJSON) : {},
            currentRoom: {},
            playerList: [],         // player list in current room
            roomList: [],           // room list
            shakePage: {
                STOPWATCH_UNIT: 100,
                TOTAL_GAME_TIME: 20 * 1000,
                timeBalance: 20 * 1000,
                stopwatchString: '00:00.0'
            },
            rankingPage: {
                playerList: []
            }
        },

        /* admin pages states */
        admin: {
            homePage: {
                roomList: []
            },
            roomPage: {
                roomDetails: {},
                players: []
            },
            editRoomDialog: {
                roomDetails: {}
            }
        }
    },

    actions: {
        /* player actions */
        createUser: function(store, user) {
            console.log('store.actions.createUser', user);

            return new Promise(function(resolve, reject) {
                api.createUser(user).then(function(data) {
                    localStorage.userId = data.user.objectId;
                    localStorage.userJSON = JSON.stringify(data.user);
                    store.state.player.currentPlayer = data.user;
                    resolve(data.user);
                }, function(error) {
                    localStorage.userId = '';
                    localStorage.userJSON = '';
                    store.state.player.currentPlayer = {};
                    reject(error);
                });
            });
        },
        signout: function(store) {
            localStorage.userId = '';
            localStorage.userJSON = '';
            store.state.player.currentPlayer = {};
        },
        updateUserDetails: function(store, user) {
            console.log('store.actions.updateUserDetails', user);
            return new Promise(function(resolve, reject) {
                api.updateUser(user).then(function(data) {
                    localStorage.userJSON = JSON.stringify(data.user);
                    store.state.player.currentPlayer = data.user;
                    resolve(data.user);
                }, function(error) {
                    reject(error);
                });
            });
        },
        getUserDetails: function(store, userId) {
            console.log('store.actions.getUserDetails', userId);
            return new Promise(function(resolve, reject) {
                api.getUser({userId: userId}).then(function(data) {
                    localStorage.userJSON = JSON.stringify(data.user);
                    store.state.player.currentPlayer = data.user;
                    resolve(data.user);
                }, function(error) {
                    localStorage.userJSON = '';
                    store.state.player.currentPlayer = {};
                    reject(error);
                });
            });
        },
        getRoomDetails: function(store, roomId) {
            console.log('store.actions.getRoomDetails', roomId);

            api.getRoom(roomId).then(function(data) {
                store.state.player.currentRoom = data.room;
            }, function(error) {
                console.log('store.actions.getRoomDetails error', error);
            });
        },
        getRoomPlayers: function(store, roomId) {
            console.log('store.actions.getRoomPlayers', roomId);
            api.getRoomPlayers(roomId).then(function(data) {
                store.state.player.playerList = data.players;
            }, function(error) {
                console.log('store.actions.getRoomPlayers error', error);
                store.state.player.playerList = [];
            });
        },
        getRoomRankingPlayers: function(store, roomId) {
            console.log('store.actions.getRankingPlayers', roomId);
            api.getRoomRankingPlayerList(roomId).then(function(data) {
                store.state.player.rankingPage.playerList = data.players;
            }, function(error) {
                console.log('store.actions.getRankingPlayers error', error);
                store.state.player.rankingPage.playerList = [];
            });
        },
        getRoomList: function(store) {
            console.log('store.actions.getRoomList');

            api.listRoom().then(function(data) {
                store.state.player.roomList = data.roomList;
            }, function(error) {
                console.log('store.actions.getRoomList error', error);
                store.state.player.roomList = [];
            });
        },
        joinRoom: function(store, request) {
            console.log('store.actions.joinRoom request', request);
            var user = request.user, roomId = request.roomId;

            return new Promise(function(resolve, reject) {
                api.joinRoom(roomId, user.objectId, user.userType).then(function(data) {
                    store.state.player.currentRoom = data.room;
                    socket.emit('join', {userId: user.objectId, roomId: data.room.objectId});
                    resolve(data.room);
                }, function(error) {
                    store.state.player.currentRoom = {};
                    store.state.player.playerList = [];
                    reject(error);
                });
            });
        },
        leaveRoom: function(store, roomId, userId) {
            console.log('store.actions.leaveRoom', roomId, userId);
            return new Promise(function(resolve, reject) {
                api.leaveRoom(roomId, userId).then(function(data) {
                    store.state.player.currentRoom = {};
                    store.state.player.playerList = [];
                    socket.emit('leave', {userId: userId, roomId: roomId});
                    resolve(data.room);
                }, function(error) {
                    reject(error);
                });
            });
        },
        clearShakeCount: function(store) {
            api.updateUser({
                objectId: store.state.player.currentPlayer.objectId,
                shakeCount: 0
            });
            store.state.player.currentPlayer.shakeCount = 0;
        },
        shake: function(store) {
            var shakeCount = ++ store.state.player.currentPlayer.shakeCount;

            store.state.player.playerList.forEach(function(p) {
                if(p.objectId === store.state.player.currentPlayer.objectId)
                    p.shakeCount = shakeCount;
            });

            api.updateUser({
                objectId: store.state.player.currentPlayer.objectId,
                shakeCount: shakeCount
            });

            socket.emit('shake', {
                userId: store.state.player.currentPlayer.objectId,
                shakeCount: shakeCount
            });
        },
        updateStopwatch: function(store, balance) {
            var s = '00' + Math.floor(balance / 1000);
            var sStr = s.substring(s.length - 2, s.length);
            var ss = balance % 1000 / store.state.player.shakePage.STOPWATCH_UNIT;

            store.state.player.shakePage.timeBalance = balance;
            store.state.player.shakePage.stopwatchString = '00:' + sStr + '.' + ss;
        },
        listenPlayerJoinSocketMessage: function(store, enable) {
            listenPlayerSocketMessage('join', enable);
        },
        listenPlayerLeaveSocketMessage: function(store, enable) {
            listenPlayerSocketMessage('leave', enable);
        },
        listenPlayerShakeSocketMessage: function(store, enable) {
            listenPlayerSocketMessage('shake', enable);
        },
        listenPlayerStatusChangeSocketMessage: function(store, enable) {
            listenPlayerSocketMessage('status-change', enable);
        },
        onJoin: function(store, message) {
            var userId = message.userId, roomId = message.roomId;

            console.log('store.actions.onJoin', userId);
            api.getUser({userId: userId}).then(function(data) {
                var exist = store.state.player.playerList.filter(function(p) {
                        return p.objectId === userId;
                    }).length !== 0;

                if(!exist)
                    store.state.player.playerList.push(data.user);
            }, function(error) {
                console.log('store.actions.onJoin get user error', error);
            });
        },
        onLeave: function(store, message) {
            var userId = message.userId, roomId = message.roomId;

            store.state.player.playerList = store.state.player.playerList.filter(function(player) {
                return player.objectId !== userId;
            });
        },
        onShake: function(store, data) {
            var userId = data.userId,
                count = data.shakeCount,
                i;

            for(i = 0; i < store.state.player.playerList.length; i ++) {
                if(store.state.player.playerList[i].objectId === userId) {
                    store.state.player.playerList[i].shakeCount = count;
                    break;
                }
            }
        },
        onStatusChange: function(store, message) {
            var roomId = message.roomId,
                status = message.status;

            if(roomId === store.state.player.currentRoom.objectId)
                store.state.player.currentRoom.status = status;

            store.state.player.roomList.forEach(function(room) {
                if(room.objectId === roomId)
                    room.status = status;
            });
        },




        adminListenSocketMessage: function(store, enable) {
            adminListenPlayerSocketMessage('shake', enable);
            adminListenPlayerSocketMessage('join', enable);
            adminListenPlayerSocketMessage('leave', enable);
        },
        adminOnJoin: function(store, message) {
            var userId = message.userId, roomId = message.roomId;

            console.log('store.actions.adminOnJoin', userId);
            api.getUser({userId: userId}).then(function(data) {
                var exist = store.state.admin.roomPage.players.filter(function(p) {
                        return p.objectId === userId;
                    }).length !== 0;

                if(!exist)
                    store.state.admin.roomPage.players.push(data.user);
            }, function(error) {
                console.log('store.actions.adminOnJoin get user error', error);
            });
        },
        adminOnLeave: function(store, message) {
            var userId = message.userId, roomId = message.roomId;

            store.state.admin.roomPage.players = store.state.admin.roomPage.players.filter(function(player) {
                return player.objectId !== userId;
            });
        },
        adminOnShake: function(store, data) {
            var userId = data.userId,
                count = data.shakeCount,
                i;

            for(i = 0; i < store.state.admin.roomPage.players.length; i ++) {
                if(store.state.admin.roomPage.players[i].objectId === userId) {
                    store.state.admin.roomPage.players[i].shakeCount = count;
                    break;
                }
            }
        }
    },

    mutations: {

    }
});
