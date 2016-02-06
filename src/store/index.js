var Vue = require('vue');
var Vuex = require('vuex').default;
var api = require('../api/api.js');

Vue.use(Vuex);
Vue.config.debug = true;

function keepLocal(user) {
    localStorage.userId = user.objectId;
    localStorage.userName = user.userName;
    localStorage.userType = user.userType;
}

// socket is global var defined in main.js
function listenPlayerSocketMessage(enable) {
    console.log('listenPlayerSocketMessage', enable);

    if(enable) {
        socket.on('join', function(userId) {
            store.actions.playerJoin(userId);
        });
        socket.on('leave', function(userId) {
            store.actions.playerLeave(userId);
        });
        socket.on('shake', function(message) {
            store.actions.updateOtherShakeData(message);
        });
    } else {
        socket.off('join');
        socket.off('leave');
        socket.off('shake');
    }
}

/*
    game (room) status:

        INIT -> JOINING -> PLAYING -> END


    WELCOME PAGE
        1. user not sign up
            1.1 sign up
            1.2 click JOIN
                - if game is STOPPED, which not allow player to join
                    player will be routed to END page
                - if game is READY, which allow player to join
                    player will be routed to READY page to wait game start
                - if game is STARTED, which not allow player to join, but will recieve play data
                    player will be routed to VISIT PAGE
        2. user signed up
            pre-fill form data, and allow player to click JOIN

    READY PAGE
        1. show game rules, and joined players
        2. if game status change to STARTED, it will count down and then route player to SHAKE page
        3. if game status change to STOPPED, player will be routed to END PAGE

    SHAKE PAGE
        1. allow user to shake
        2. if game end, status change to STOPPED, player will be routed to RANKING page

    END PAGE
        1. will display: game is not started yet, and this is the last ranking data
        2. if game status change to READY, will offer player a "join game" button to join the game
        3. then follow WELCOME PAGE join game logic

    RANKING PAGE
        1.

    VISIT PAGE
        1. user is able to see other players shake data
        2. if game end, status change to STOPPED, it will route to RANKING PAGE
 */

module.exports = window.store = new Vuex.Store({
    state: {
        gameId: '',
        gameStatus: 'STOPPED', // 'STOPPED': not allow player to join -> 'READY': allow player to join  -> 'STARTED': not allow player to join
        gameSize: 5,    // 5 players
        gameTime: 20,   // seconds
        mask: false,
        playerList: [],
        currentPlayer: {
            userName: '',
            userId: '',
            userType: '',
            userStatus: '',
            shakeCount: 0
        },
        pages: {
            welcome: {

            },
            lobby: {

            },
            dashboard: {

            }
        },
        player: {
            userName: '',
            userId: '',
            userType: '',
            welcomeView: {
                userNameFormMessage: '',
            }
        },

        dashboard: {

        }
    },

    actions: {
        // player actions
        selectUserType: function(store, type) {
            console.log('store.actions.selectUserType', type);
            store.dispatch('SELECT_USER_TYPE', type);
        },
        start: function(store, data) {
            return new Promise(function(resolve, reject) {
                console.log('store.actions.joinGame', data);
                var request = {
                    userName: data.userName,
                    userType: data.userType
                };

                if(!data.userName) {
                    store.dispatch('PLAYER_WELCOME_USER_NAME_FORM_MESSAGE', 'please input correct user name');
                    return;
                } else {
                    store.dispatch('PLAYER_WELCOME_USER_NAME_FORM_MESSAGE', '');
                    store.actions.showMask();

                    api.createUser(request).then(function(data) {
                        store.dispatch('PLAYER_USER_CREATED_SUCCESSFULLY', data.user);
                        keepLocal(data.user);

                        store.actions.hideMask();
                        resolve(data.user);
                    }, function(error) {
                        store.actions.hideMask();
                        console.log('store.actions.joinGame error', error);
                        reject(error);
                    })
                }
            });
        },
        joinGame: function(store, userId) {
            var request = {
                userId: userId,
                userStatus: 'JOINED',
                shakeCount: 0
            };

            // update current players status, and get the latest data in DB
            api.updateUser(request).then(function(data) {
                store.dispatch('UPDATE_CURRENT_PLAYER_INFO', data.user);
                listenPlayerSocketMessage(true);
                keepLocal(data.user);
                socket.emit('join', userId);
            }, function(error) {

            });

            // get players who already joined the game
            store.actions.getPlayerList();
        },
        leaveGame: function(store, userId) {
            var request = {
                userId: userId,
                userStatus: '',
                shakeCount: 0
            };

            console.log('store.actions.leaveGame', userId);

            api.updateUser(request).then(function() {
                listenPlayerSocketMessage(false);
                socket.emit('leave', userId);
            }, function(error) {

            });
        },
        inputUserName: function(store, userName) {
            store.dispatch('PLAYER_INPUT_USER_NAME', userName);
        },
        getPlayerList: function(store) {
            return new Promise(function(resolve, reject) {
                api.listUser().then(function(data) {
                    store.dispatch('GET_PLAYER_LIST', data.userList);
                    resolve(data.userList);
                }, function(error) {
                    reject(error);
                    console.log('store.actions.getPlayerList error', error);
                })
            });
        },
        shake: function(store) {
            store.dispatch('PLAYER_SHAKE_COUNT');

            api.updateUser({
                userId: store.state.currentPlayer.userId,
                shakeCount: store.state.currentPlayer.shakeCount
            });

            socket.emit('shake', {
                userId: store.state.currentPlayer.userId,
                shakeCount: store.state.currentPlayer.shakeCount
            });
        },
        updateOtherShakeData: function(store, data) {
            store.dispatch('UPDATE_OTHER_SHAKE_DATA', data);
        },
        showMask: function(store) {
            store.dispatch('SHOW_MASK');
        },
        hideMask: function(store) {
            store.dispatch('HIDE_MASK');
        },

        // dashboard actions
        initDashboard: function(store) {
            store.actions.getPlayerList();
            listenPlayerSocketMessage(true);
        },
        startGame: function(store) {
            var request = {
                gameSize: store.state.gameSize,
                gameTime: store.state.gameTime
            };

            if(store.state.gameStatus === 'STOPPED') {
                api.startGame(request).then(function(data) {
                    store.dispatch('UPDATE_GAME_STATUS', 'STARTED');
                }, function(error) {

                });

            } else {
                console.log('store.actions.startGame game is already started, cannot start again');
            }
        },
        stopGame: function(store) {
            if(store.state.gameStatus === 'STARTED') {
                api.updateGameStatus()
                store.dispatch('UPDATE_GAME_STATUS', 'STOPPED');
            } else {
                console.log('store.actions.startGame game is already stopped, cannot stop again');
            }
        },

        // socket will call these
        playerJoin: function(store, userId) {
            console.log('store.actions.playerJoin', userId);

            api.getUser({userId: userId}).then(function(data) {
                store.dispatch('PLAYER_JOIN', data.user);
            }, function(error) {

            });
        },
        playerLeave: function(store, userId) {
            console.log('store.actions.playerLeave', userId);
            store.dispatch('PLAYER_LEAVE', userId);
        }

    },

    mutations: {
        SHOW_MASK: function(state) {
            state.mask = true;
        },
        HIDE_MASK: function(state) {
            state.mask = false;
        },
        PLAYER_INPUT_USER_NAME: function(state, userName) {
            state.player.userName = userName;
        },
        SELECT_USER_TYPE: function(state, type) {
            state.player.userType = type;
        },
        PLAYER_WELCOME_USER_NAME_FORM_MESSAGE: function(state, message) {
            state.player.welcomeView.userNameFormMessage = message;
        },
        PLAYER_USER_CREATED_SUCCESSFULLY: function(state, user) {
            console.log('store.mutations.PLAYER_USER_CREATED_SUCCESSFULLY', user);
            state.player.userName = user.userName;
            state.player.userType = user.userType;
            state.player.userId = user.objectId;
        },
        GET_PLAYER_LIST: function(state, playerList) {
            console.log('store.mutations.GET_PLAYER_LIST', playerList);
            state.playerList = playerList;
        },
        PLAYER_SHAKE_COUNT: function(state) {
            state.currentPlayer.shakeCount ++;
        },
        UPDATE_OTHER_SHAKE_DATA: function(state, data) {
            var userId = data.userId,
                count = data.shakeCount,
                i;

            for(i = 0; i < state.playerList.length; i ++) {
                if(state.playerList[i].objectId === userId) {
                    state.playerList[i].shakeCount = count;
                    return;
                }
            }
        },
        UPDATE_CURRENT_PLAYER_INFO: function(state, user) {
            state.currentPlayer = {
                userId: user.objectId,
                userName: user.userName,
                userType: user.userType,
                userStatus: user.userStatus,
                shakeCount: user.shakeCount
            }
        },
        PLAYER_JOIN: function(state, player) {
            var exist = state.playerList.filter(function(p) {
                return p.objectId === player.objectId;
            }).length !== 0;

            if(!exist)
                state.playerList.push(player);
        },
        PLAYER_LEAVE: function(state, userId) {
            state.playerList = state.playerList.filter(function(p) {
                return p.objectId !== userId;
            })
        },

        // dashboard
        UPDATE_GAME_STATUS: function(state, status) {
            state.gameStatus = status;
        }
    }
});
