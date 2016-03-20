var Vue = require('vue');
var Vuex = require('vuex').default;
var api = require('../api/api.js');
var Stopwatch = require('timer-stopwatch');

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
        show: false,
        STOPWATCH_UNIT: 100,
        TOTAL_GAME_TIME: 15 * 1000,
        timeBalance: 15 * 1000,
        stopwatchString: '00:00.0'
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
        getRoomRankingPlayers: function(store, roomId) {
            api.getRoomRankingPlayerList(roomId).then(function(data) {
                store.state.rankingPlayerList = data.players;
            }, function(error) {
                console.log('store.actions.getRoomRankingPlayers error', error);
            });
        },
        show: function(store) {
            store.state.show = true;
        },
        hide: function(store) {
            store.state.show = false;
            PageAPI.clear();
        },
        startStopwatch: function(store) {
            var unit = store.state.STOPWATCH_UNIT;
            var total = store.state.timeBalance = store.state.TOTAL_GAME_TIME;

            var timer = new Stopwatch(total, {refreshRateMS: unit});

            timer.onTime(function() {
                if(total > 0)
                    store.actions.updateStopwatch(total);

                total -= unit;
            });

            timer.onDone(function() {
                store.actions.updateStopwatch(0);
                timer = null;
            });

            timer.start();
        },
        updateStopwatch: function(store, balance) {
            var s = '00' + Math.floor(balance / 1000);
            var sStr = s.substring(s.length - 2, s.length);
            var ss = balance % 1000 / store.state.STOPWATCH_UNIT;

            store.state.timeBalance = balance;
            store.state.stopwatchString = '00:' + sStr + '.' + ss;
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

                    var timer = new Stopwatch(3000, {refreshRateMS: 1000});
                    var count = 3;

                    Materialize.toast('您准备好了吗？游戏马上开始！', 1500);

                    timer.onTime(function() {
                        if(count > 0)
                            Materialize.toast('倒计时：' + count, 700);
                        if(count === 0)
                            Materialize.toast('Go!', 700);
                        count --;
                    });
                    timer.onDone(function() {
                        store.actions.startStopwatch();
                    });

                    setTimeout(function() {
                        timer.start();
                    }, 2000);

                    break;
                case 'END':
                    store.actions.off('join');
                    store.actions.off('leave');
                    store.actions.off('shake');
                    store.actions.getRoomDetails(roomId);
                    store.actions.getRoomRankingPlayers(roomId);
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
