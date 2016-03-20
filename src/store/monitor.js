var Vue = require('vue');
var Vuex = require('vuex').default;
var api = require('../api/api.js');

Vue.use(Vuex);
Vue.config.debug = true;

function listenSocketMessage(type, enable) {
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
        rankingPlayerList: [],
        playerList: [],
        show: false
    },

    actions: {
        getRoomDetails: function(store, roomId) {
            api.getRoom(roomId).then(function(data) {
                store.state.room = data.room;
            }, function(error) {
                console.log('store.actions.getRoomDetails error', error);
            });
        },
        getRoomPlayers: function(store, roomId) {
            api.getRoomPlayers(roomId).then(function(data) {
                store.state.playerList = data.players;
            }, function(error) {
                console.log('store.actions.getRoomPlayers error', error);
            });
        },
        getRoomRanking: function(store, roomId) {
            api.getRoomRankingPlayerList(roomId).then(function(data) {
                store.state.rankingPlayerList = data.players;
            }, function(error) {
                console.log('store.actions.getRoomRanking error', error);
            });
        },
        show: function(store) {
            store.state.show = true;
        },
        hide: function(store) {
            store.state.show = false;
            PageAPI.clear();
        },
        onJoin: function(store, message) {
            var userId = message.userId;
            api.getUser({userId: userId}).then(function(data) {
                var exist = store.state.playerList.filter(function(p) {
                        return p.objectId === userId;
                    }).length !== 0;

                if(!exist) {
                    store.state.playerList.push(data.user);
                    PageAPI.join(data.user);
                }

            }, function(error) {
                console.log('store.actions.onJoin get user error', error);
            });
        },
        onLeave: function(store, message) {
            var userId = message.userId;
            store.state.playerList = store.state.playerList.filter(function(player) {
                return player.objectId !== userId;
            });

            PageAPI.leave(userId);
        },
        onShake: function(store, message) {
            var userId = message.userId,
                count = message.shakeCount;

            for(var i = 0; i < store.state.playerList.length; i ++) {
                if(store.state.playerList[i].objectId === userId) {
                    store.state.playerList[i].shakeCount = count;
                    PageAPI.shake(userId, count);
                    break;
                }
            }
        },
        onStatusChange: function(store, message) {
            var roomId = message.roomId,
                status = message.status;

            store.state.room.status = status;
            switch(status) {
                case 'JOINING':
                    store.actions.on('join');
                    store.actions.on('leave');

                    store.actions.getRoomDetails(roomId);
                    store.actions.getRoomPlayers(roomId);
                    store.actions.hide();

                    setTimeout(function() {
                        store.actions.show();
                    }, 1000);
                    break;
                case 'PLAYING':
                    store.actions.on('shake');
                    store.actions.off('join');
                    store.actions.off('leave');
                    break;
                case 'END':
                    store.actions.off('join');
                    store.actions.off('leave');
                    store.actions.off('shake');
                    store.actions.getRoomRanking(roomId);
                    break;
                default:
                    break;
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
