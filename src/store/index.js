var Vue = require('vue');
var Vuex = require('vuex').default;
var api = require('../api/api.js');

Vue.use(Vuex);
Vue.config.debug = true;

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
                formUserName: '',
                formUserType: '',
                formUserNameMessage: '',
                formUserTypeMessage: ''
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

        }
    },

    actions: {
        /* player actions */
        inputUserName: function(store, userName) {
            console.log('store.actions.inputUserName', userName);
            store.state.player.welcomePage.formUserName = userName;
        },
        inputUserType: function(store, userType) {
            console.log('store.actions.inputUserType', userType);
            store.state.player.welcomePage.formUserType = userType;
        },
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
                    resolve(data.room);
                }, function(error) {
                    reject(error);
                });
            });
        },



        /* admin acitons */






        // player actions


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
        UPDATE_USER_DETAILS: function(state, user) {
            state.currentPlayer.userId = user.objectId;
            state.currentPlayer.userName = user.userName;
            state.currentPlayer.userType = user.userType;
            state.currentPlayer.shakeCount = user.shakeCount;

            keepLocal(user);
        },



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
