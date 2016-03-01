var Vue = require('vue');
var Vuex = require('vuex').default;
var api = require('../api/api.js');

Vue.use(Vuex);
Vue.config.debug = true;

function listenSocketMessage(type, enable) {
    console.log('listenSocketMessage', type, enable);
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
        room: {},
        playerList: [],
        show: false
    },

    actions: {
        getRoomDetails: function(store, roomId) {
            console.log('store.actions.getRoomDetails', roomId);

            api.getRoom(roomId).then(function(data) {
                store.state.room = data.room;
            }, function(error) {
                console.log('store.actions.getRoomDetails error', error);
            });
        },
        getRoomPlayers: function(store, roomId) {
            console.log('store.actions.getRoomPlayers', roomId);
            api.getRoomPlayers(roomId).then(function(data) {
                store.state.playerList = data.players;
            }, function(error) {
                console.log('store.actions.getRoomPlayers error', error);
            });
        },
        show: function(store) {
            store.state.show = true;
        },
        hide: function(store) {
            store.state.show = false;
        },
        onJoin: function(store, message) {
            var userId = message.userId;
            console.log('store.actions.onJoin', message);
            api.getUser({userId: userId}).then(function(data) {
                var exist = store.state.playerList.filter(function(p) {
                        return p.objectId === userId;
                    }).length !== 0;

                if(!exist)
                    store.state.playerList.push(data.user);
            }, function(error) {
                console.log('store.actions.onJoin get user error', error);
            });
        },
        onLeave: function(store, message) {
            var userId = message.userId;
            console.log('store.actions.onLeave', message);
            store.state.playerList = store.state.playerList.filter(function(player) {
                return player.objectId !== userId;
            });
        },
        onShake: function(store, message) {
            var userId = message.userId,
                count = message.shakeCount;
            console.log('store.actions.onShake', message);
            for(i = 0; i < store.state.playerList.length; i ++) {
                if(store.state.playerList[i].objectId === userId) {
                    store.state.playerList[i].shakeCount = count;
                    break;
                }
            }
        },
        onStatusChange: function(store, message) {
            var roomId = message.roomId,
                status = message.status;

            console.log('store.actions.onStatusChange', message);
            if(status === 'JOINING') {
                store.actions.getRoomDetails(roomId);
                store.actions.getRoomPlayers(roomId);

                store.actions.hide();
                setTimeout(function() {
                    store.actions.show();
                }, 1000);
            } else {
                store.state.room.status = status;
            }
        },

        on: function(store, message) {
            listenSocketMessage(message, true);
        },
        off: function(store, message) {
            listenSocketMessage(message, false);
        }

    },

    mutations: {

    }
});
