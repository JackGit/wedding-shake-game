var Vue = require('vue');

function callservice(url, request) {
    return new Promise(function(resolve, reject) {
        console.log('callservice::url, request', url, request);
        Vue.http.post(url, request).then(function(response) {
            console.log('callservice::response', response);
            if(response.data.statusCode === 0) {
                resolve(response.data);
            } else {
                reject(response.data.error);
            }
        }, function(error) {
            alert('system callservice error');
            console.log('callservice::error', error);
            reject(error);
        });
    });
}

var API = {
    createUser: function(request) {
        return callservice('/game/user/create', request);
    },
    updateUser: function(request) {
        return callservice('/game/user/update', request);
    },
    listUser: function() {
        return callservice('/game/user/list', {});
    },
    getUser: function(request) {
        return callservice('/game/user/get', request);
    },
    getUsers: function(userIds) {
        return callservice('/game/user/list', {
            userIds: userIds
        });
    },
    getRoom: function(roomId) {
        return callservice('/game/room/get', {
            roomId: roomId
        });
    },
    getRoomPlayers: function(roomId) {
        return callservice('/game/room/playerList', {roomId: roomId});
    },
    listRoom: function() {
        return callservice('/game/room/list');
    },
    joinRoom: function(roomId, userId, userType) {
        return callservice('/game/user/joinRoom', {
            userId: userId,
            userType: userType,
            roomId: roomId
        });
    },
    leaveRoom: function(roomId, userId) {
        return callservice('/game/user/leaveRoom', {
            roomId: roomId,
            userId: userId
        });
    }
};

module.exports = window.api = API;