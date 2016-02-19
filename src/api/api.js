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
    updateUser: function(user) {
        return callservice('/game/user/update', {user: user});
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
    createRoom: function(room) {
        var request = {
            roomName: room.roomName,
            roomDescription: room.roomDescription,
            roomSize: room.roomSize
        };
        return callservice('/game/room/create', request);
    },
    getRoom: function(roomId) {
        return callservice('/game/room/get', {
            roomId: roomId
        });
    },
    getRoomPlayers: function(roomId) {
        return callservice('/game/room/playerList', {roomId: roomId});
    },
    updateRoom: function(room) {
        return callservice('/game/room/update', room);
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