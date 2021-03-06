var Vue = require('vue');
var Vuex = require('vuex').default;
var api = require('../api/api.js');

Vue.use(Vuex);
Vue.config.debug = true;
;

function initPersist() {
    try {
        window.persist = new Persist.Store('Wedding Shake Game');
    } catch(e) {
        alert('[Fatal Error]: init persist failed');
        console.log(e);
    }
}

initPersist();

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
            return new Promise(function(resolve, reject) {
                api.adminLogin(user).then(function(data) {
                    if(data.user) {
                        store.state.admin.user = {objectId: data.user.objectId, userName: data.user.userName};
                        //localStorage.adminUserId = data.user.objectId;
                        persist.set('adminUserId', data.user.objectId);
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
            //localStorage.adminUserId = '';
            persist.remove('adminUserId');
        },
        checkAdminUser: function(store, userId) {
            return new Promise(function(resolve, reject) {
                api.getAdminUser(userId).then(function(data) {
                    store.state.admin.user = {objectId: data.user.objectId, userName: data.user.userName};
                    resolve(data.user);
                }, function(error) {
                    reject(error);
                });
            });
        },
        getRoomList: function(store) {
            api.listRoom().then(function(data) {
                store.state.admin.roomList = data.roomList;
            }, function(error) {
                console.log('store.actions.getAdminRoomList error', error);
            });
        },
        getRoomDetails: function(store, roomId) {
            api.getRoom(roomId).then(function(data) {
                store.state.admin.currentRoom = data.room;
            }, function(error) {
                console.log('store.actions.getRoomDetails error', error);
            });
        },
        getRoomPlayers: function(store, roomId) {
            api.getRoomPlayers(roomId).then(function(data) {
                store.state.admin.playerList = data.players;
            }, function(error) {
                console.log('store.actions.getRoomPlayers error', error);
            });
        },
        createRoom: function(store, room) {
            return new Promise(function(resolve, reject) {
                api.createRoom(room).then(function(data) {
                    resolve(data.room);
                }, function(error) {
                    reject(error);
                });
            });
        },
        updateRoom: function(store, room) {
            return new Promise(function(resolve, reject) {
                api.updateRoom(room).then(function(data) {
                    store.state.admin.currentRoom = data.room;
                    resolve(data.room);
                }, function(error) {
                    reject(error);
                });
            });
        },
        deleteRoom: function(store, roomId) {
            return new Promise(function(resolve, reject) {
                api.deleteRoom(roomId).then(function() {
                    store.state.admin.currentRoom = {};
                    resolve();
                }, function(error) {
                    reject(error);
                });
            });
        },
        allowToJoinRoom: function(store, roomId) {
            api.allowJoin(roomId).then(function(data) {
                store.state.admin.currentRoom = data.room;
                socket.emit('status-change', {roomId: roomId, status: 'JOINING'});
            }, function(error) {
                console.log('store.actions.allowToJoinRoom error', error);
            });
        },
        startRoom: function(store, roomId) {
            api.startGame(roomId).then(function(data) {
                store.state.admin.currentRoom = data.room;
                socket.emit('status-change', {roomId: roomId, status: 'PLAYING'});
            }, function(error) {
                console.log('store.actions.startRoom error', error);
            });
        },
        stopRoom: function(store, roomId) {
            api.stopGame(roomId).then(function(data) {
                store.state.admin.currentRoom = data.room;
                socket.emit('status-change', {roomId: roomId, status: 'END'});
            }, function(error) {
                console.log('store.actions.stopRoom error', error);
            });
        }
    },

    mutations: {

    }
});
