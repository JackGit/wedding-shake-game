var Vue = require('vue');

function callservice(url, request) {
    return new Promise(function(resolve, reject) {
        Vue.http.post(url, request).then(function(response) {
            if(response.data.statusCode === 0) {
                resolve(response.data);
            } else {
                reject(response.data.error);
            }
        }, function(error) {
            alert('system callservice error');
            console.log('system callservice error', error);
            reject(error);
        });
    });
}

module.exports = {
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
    }
};