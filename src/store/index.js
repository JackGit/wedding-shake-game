var Vue = require('vue');
var Vuex = require('vuex').default;
var api = require('../api/api.js');

require('es6-promise').polyfill();


Vue.use(Vuex);
Vue.config.debug = true;

var persist;

function initPersist() {
    try {
        persist = new Persist.Store('Wedding Shake Game');
    } catch(e) {
        alert('[Fatal Error]: init persist failed');
        console.log(e);
    }
}


initPersist();

function listenPlayerSocketMessage(type, enable) {
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
            currentPlayer: persist.get('userJSON') ? JSON.parse(persist.get('userJSON')): {},
            currentRoom: {},
            playerList: [],         // player list in current room
            roomList: [],           // room list
            shakePage: {
                STOPWATCH_UNIT: 100,
                TOTAL_GAME_TIME: 15 * 1000,
                timeBalance: 15 * 1000,
                stopwatchString: '00:00.0'
            },
            rankingPage: {
                playerList: []
            }
        }
    },

    actions: {
        /* player actions */
        createUser: function(store, user) {
            return new Promise(function(resolve, reject) {
                api.createUser(user).then(function(data) {
                    persist.set('userId', data.user.objectId);
                    persist.set('userJSON', JSON.stringify(data.user));
                    store.state.player.currentPlayer = data.user;
                    resolve(data.user);
                }, function(error) {
                    persist.remove('userId');
                    persist.remove('userJSON');
                    store.state.player.currentPlayer = {};
                    reject(error);
                });
            });
        },
        signout: function(store) {
            persist.remove('userId');
            persist.remove('userJSON');
            store.state.player.currentPlayer = {};
        },
        updateUserDetails: function(store, user) {
            return new Promise(function(resolve, reject) {
                api.updateUser(user).then(function(data) {
                    persist.set('userJSON', JSON.stringify(data.user));
                    store.state.player.currentPlayer = data.user;
                    resolve(data.user);
                }, function(error) {
                    reject(error);
                });
            });
        },
        getUserDetails: function(store, userId) {
            return new Promise(function(resolve, reject) {
                api.getUser({userId: userId}).then(function(data) {
                    persist.set('userJSON', JSON.stringify(data.user));
                    store.state.player.currentPlayer = data.user;
                    resolve(data.user);
                }, function(error) {
                    persist.remove('userJSON');
                    store.state.player.currentPlayer = {};
                    reject(error);
                });
            });
        },
        getRoomDetails: function(store, roomId) {
            api.getRoom(roomId).then(function(data) {
                store.state.player.currentRoom = data.room;
            }, function(error) {
                console.log('store.actions.getRoomDetails error', error);
            });
        },
        getRoomPlayers: function(store, roomId) {
            api.getRoomPlayers(roomId).then(function(data) {
                store.state.player.playerList = data.players;
            }, function(error) {
                console.log('store.actions.getRoomPlayers error', error);
                store.state.player.playerList = [];
            });
        },
        getRoomRankingPlayers: function(store, roomId) {
            api.getRoomRankingPlayerList(roomId).then(function(data) {
                store.state.player.rankingPage.playerList = data.players;
            }, function(error) {
                console.log('store.actions.getRankingPlayers error', error);
                store.state.player.rankingPage.playerList = [];
            });
        },
        getRoomList: function(store) {
            api.listRoom().then(function(data) {
                store.state.player.roomList = data.roomList;
            }, function(error) {
                console.log('store.actions.getRoomList error', error);
                store.state.player.roomList = [];
            });
        },
        joinRoom: function(store, request) {
            var user = request.user, roomId = request.roomId;

            return new Promise(function(resolve, reject) {
                api.joinRoom(roomId, user.objectId, user.userType).then(function(data) {
                    store.state.player.currentRoom.objectId = roomId;
                    store.state.player.currentPlayer = data.user;
                    socket.emit('join', {userId: user.objectId, roomId: roomId});
                    resolve(data);
                }, function(error) {
                    store.state.player.currentRoom = {};
                    store.state.player.playerList = [];
                    reject(error);
                });
            });
        },
        leaveRoom: function(store, roomId, userId) {
            return new Promise(function(resolve, reject) {
                api.leaveRoom(roomId, userId).then(function(data) {
                    store.state.player.currentRoom = {};
                    store.state.player.playerList = [];
                    socket.emit('leave', {userId: userId, roomId: roomId});
                    resolve(data);
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

            persist.set('shakeCount', shakeCount);
            socket.emit('shake', {
                userId: store.state.player.currentPlayer.objectId,
                shakeCount: shakeCount
            });

            playShakeSound(); // global method
        },
        updateShakeCount: function(store) {
            var shakeCount = persist.get('shakeCount');
            api.updateUser({
                objectId: store.state.player.currentPlayer.objectId,
                shakeCount: shakeCount * 1
            });

            persist.remove('shakeCount');
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

            if(roomId === store.state.player.currentRoom.objectId) {
                store.state.player.currentRoom.status = status;

                if(status === 'END') {
                    store.actions.getRoomDetails(roomId);
                    store.actions.getRoomRankingPlayers(roomId);
                }
            }

            store.state.player.roomList.forEach(function(room) {
                if(room.objectId === roomId)
                    room.status = status;
            });
        }
    },

    mutations: {

    }
});
