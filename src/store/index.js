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

module.exports = window.store = new Vuex.Store({
    state: {
        /* player pages states */
        player: {
            currentPlayer: {
                userId: localStorage.userId || '',
                userName: '',
                userType: '',
                shakeCount: 0
            },
            welcomePage: {

            },
            pageMask: false,
            homePage: {
                roomList: []            // need socket.io to update this field
            },
            readyPage: {
                roomDetails: {},         // need socket.io to update this field
                players: [],
                gameStatus: ''
            },
            shakePage: {

            },
            rankingPage: {

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
        registerPlayer: function(store, user) {
            console.log('store.actions.registerPlayer', user);

            return new Promise(function(resolve, reject) {
                api.createUser(user).then(function(data) {
                    store.state.player.currentPlayer.userId = localStorage.userId = data.user.objectId;
                    store.state.player.currentPlayer.userName = data.user.userName;
                    store.state.player.currentPlayer.userType = data.user.userType;
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
                    var user = data.user;
                    store.state.player.currentPlayer.userName = user.userName;
                    store.state.player.currentPlayer.userType = user.userType;
                    resolve(user);
                }, function(error) {
                    reject(error);
                });
            });
        },
        clearUserData: function(store) {
            localStorage.userId = '';
            store.state.player.currentPlayer.userId = '';
            store.state.player.currentPlayer.userName = '';
            store.state.player.currentPlayer.userType = '';
            store.state.player.currentPlayer.shakeCount = 0;
        },
        getRoomDetails: function(store, roomId) {
            console.log('store.actions.getRoomDetails', roomId);

            api.getRoom(roomId).then(function(data) {
                store.state.player.readyPage.roomDetails = data.room;
            }, function(error) {
                console.log('store.actions.getRoomDetails error', error);
            });
        },
        getRoomPlayers: function(store, roomId) {
            console.log('store.actions.getRoomPlayers', roomId);
            api.getRoomPlayers(roomId).then(function(data) {
                store.state.player.readyPage.players = data.players;
            }, function(error) {
                console.log('store.actions.getRoomPlayers error', error);
            });
        },
        getRoomList: function(store) {
            console.log('store.actions.getRoomList');

            api.listRoom().then(function(data) {
                store.state.player.homePage.roomList = data.roomList;
            }, function(error) {
                console.log('store.actions.getRoomList error', error);
            });
        },
        joinRoom: function(store, request) {
            console.log('store.actions.joinRoom request', request);
            var user = request.user, roomId = request.roomId;

            return new Promise(function(resolve, reject) {
                api.joinRoom(roomId, user.userId, user.userType).then(function(data) {
                    socket.emit('join', {userId: user.userId, roomId: roomId});
                    resolve(data.room);
                }, function(error) {
                    reject(error);
                });
            });
        },
        leaveRoom: function(store, roomId, userId) {
            console.log('store.actions.leaveRoom', roomId, userId);
            return new Promise(function(resolve, reject) {
                api.leaveRoom(roomId, userId).then(function(data) {
                    socket.emit('leave', {userId: userId, roomId: roomId});
                    resolve(data.room);
                }, function(error) {
                    reject(error);
                });
            });
        },
        clearShakeCount: function(store) {
            store.state.player.currentPlayer.shakeCount = 0;
        },
        shake: function(store) {
            var shakeCount = ++ store.state.player.currentPlayer.shakeCount;

            api.updateUser({
                userId: store.state.player.currentPlayer.userId,
                shakeCount: shakeCount
            });

            socket.emit('shake', {
                userId: store.state.player.currentPlayer.userId,
                shakeCount: shakeCount
            });
        },



        /* admin actions */
        getAdminRoomList: function(store) {
            console.log('store.actions.getAdminRoomList');

            api.listRoom().then(function(data) {
                store.state.admin.homePage.roomList = data.roomList;
            }, function(error) {
                console.log('store.actions.getAdminRoomList error', error);
            });
        },
        getAdminRoomDetails: function(store, roomId) {
            console.log('store.actions.getAdminRoomDetails', roomId);

            api.getRoom(roomId).then(function(data) {
                store.state.admin.roomPage.roomDetails = data.room;
            }, function(error) {
                console.log('store.actions.getAdminRoomDetails error', error);
            });
        },
        getAdminRoomPlayers: function(store, roomId) {
            console.log('store.actions.getAdminRoomPlayers', roomId);
            api.getRoomPlayers(roomId).then(function(data) {
                store.state.admin.roomPage.players = data.players;
            }, function(error) {
                console.log('store.actions.getAdminRoomPlayers error', error);
            });
        },
        getEditRoomDialogData: function(store, roomId) {
            if(roomId) {
                api.getRoom(roomId).then(function(data) {
                    store.state.admin.editRoomDialog.roomDetails = data.room;
                }, function(error) {
                    console.log('store.actions.getEditRoomDialogData error', error);
                });
            } else {
                store.state.admin.editRoomDialog.roomDetails = {
                    roomName: '',
                    roomDescription: '',
                    roomSize: 5
                };
            }
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
                    resolve(data.room);
                }, function(error) {
                    reject(error);
                });
            });
        },
        allowToJoinRoom: function(store, roomId) {
            if(store.state.admin.roomPage.roomDetails.status === 'JOINING')
                return;

            api.updateRoom({roomId: roomId, status: 'JOINING'}).then(function(data) {
                console.log('store.actions.allowToJoinRoom success');
                store.state.admin.roomPage.roomDetails = data.room;
            }, function(error) {
                console.log('store.actions.allowToJoinRoom error', error);
            });
        },
        startRoom: function(store, roomId) {
            if(store.state.admin.roomPage.roomDetails.status === 'PLAYING')
                return;

            api.updateRoom({roomId: roomId, status: 'PLAYING'}).then(function(data) {
                console.log('store.actions.startRoom success');
                store.state.admin.roomPage.roomDetails = data.room;
            }, function(error) {
                console.log('store.actions.startRoom error', error);
            });
        },
        stopRoom: function(store, roomId) {
            api.updateRoom({roomId: roomId, status: 'END'}).then(function(data) {
                console.log('store.actions.stopRoom success');
            }, function(error) {
                console.log('store.actions.stopRoom error', error);
            });
        },
        listenSocketMessage: function(store, enable) {
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
