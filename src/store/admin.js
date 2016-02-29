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
        admin: {
            user: {},
            roomList: [],
            playerList: [],
            currentRoom: {}
        }
    },

    actions: {

        login: function(store, user) {
            console.log('store.actions.login', user);

            return new Promise(function(resolve, reject) {
                api.adminLogin(user).then(function(data) {
                    if(data.user) {
                        store.state.admin.user = {objectId: data.user.objectId, userName: data.user.userName};
                        resolve(data.user);
                    } else {
                        reject('no user find');
                    }
                }, function(error) {
                    reject(error);
                });
            });
        },

        signout: function(store) {
            store.state.admin.user = {};
        },

        /* admin actions */
        getRoomList: function(store) {
            console.log('store.actions.getRoomList');

            api.listRoom().then(function(data) {
                store.state.admin.roomList = data.roomList;
            }, function(error) {
                console.log('store.actions.getAdminRoomList error', error);
            });
        },
        getRoomDetails: function(store, roomId) {
            console.log('store.actions.getRoomDetails', roomId);

            api.getRoom(roomId).then(function(data) {
                store.state.admin.currentRoom = data.room;
            }, function(error) {
                console.log('store.actions.getRoomDetails error', error);
            });
        },
        getRoomPlayers: function(store, roomId) {
            console.log('store.actions.getRoomPlayers', roomId);
            api.getRoomPlayers(roomId).then(function(data) {
                store.state.admin.playerList = data.players;
            }, function(error) {
                console.log('store.actions.getRoomPlayers error', error);
            });
        },
        createRoom: function(store, room) {
            console.log('store.actions.createRoom', room);

            return new Promise(function(resolve, reject) {
                api.createRoom(room).then(function(data) {
                    store.state.admin.editRoomDialog.roomDetails = data.room;
                    resolve(data.room);
                }, function(error) {
                    reject(error);
                });
            });
        },
        updateRoom: function(store, room) {
            console.log('store.actions.updateRoom', room);
            return new Promise(function(resolve, reject) {
                api.updateRoom(room).then(function(data) {
                    store.state.admin.currentRoom = data.room;
                    resolve(data.room);
                }, function(error) {
                    reject(error);
                });
            });
        },
        allowToJoinRoom: function(store, roomId) {
            if(store.state.admin.roomPage.roomDetails.status === 'JOINING')
                return;

            api.allowJoin(roomId).then(function(data) {
                console.log('store.actions.allowToJoinRoom success');
                store.state.admin.roomPage.roomDetails = data.room;
                socket.emit('status-change', {roomId: roomId, status: 'JOINING'});
            }, function(error) {
                console.log('store.actions.allowToJoinRoom error', error);
            });
        },
        startRoom: function(store, roomId) {
            if(store.state.admin.roomPage.roomDetails.status === 'PLAYING')
                return;

            api.startGame(roomId).then(function(data) {
                console.log('store.actions.startRoom success');
                store.state.admin.roomPage.roomDetails = data.room;
                socket.emit('status-change', {roomId: roomId, status: 'PLAYING'});
            }, function(error) {
                console.log('store.actions.startRoom error', error);
            });
        },
        stopRoom: function(store, roomId) {
            api.stopGame(roomId).then(function(data) {
                console.log('store.actions.stopRoom success');
                store.state.admin.roomPage.roomDetails = data.room;
                socket.emit('status-change', {roomId: roomId, status: 'END'});
            }, function(error) {
                console.log('store.actions.stopRoom error', error);
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
