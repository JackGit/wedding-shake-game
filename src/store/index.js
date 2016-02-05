var Vue = require('vue');
var Vuex = require('vuex').default;
var api = require('../api/api.js');

Vue.use(Vuex);
Vue.config.debug = true;

module.exports = window.store = new Vuex.Store({
    state: {
        mask: false,
        playerList: [],

        player: {
            userName: '',
            userId: '',
            userType: '',
            shakeCount: 0,
            welcomeView: {
                userNameFormMessage: '',
            }
        },

        dashboard: {

        }
    },
    actions: {
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
                        localStorage.userId = data.user.objectId;
                        localStorage.userName = data.user.userName;
                        localStorage.userType = data.user.userType;

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
                userStatus: 'JOINED'
            };

            console.log('store.actions.joinGame', userId);

            api.updateUser(request).then(function() {
                console.log('store.actions.joinGame update userStatus successfully');
                socket.emit('join', userId);
            }, function(error) {

            });
        },
        leaveGame: function(store, userId) {
            var request = {
                userId: userId,
                userStatus: ''
            };

            console.log('store.actions.leaveGame', userId);

            api.updateUser(request).then(function() {
                console.log('store.actions.leaveGame update userStatus successfully');
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
            socket.emit('shake', {
                userId: store.state.player.userId,
                shakeCount: store.state.player.shakeCount
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
        },


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
            state.player.shakeCount ++;
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
        }
    }
});
