module.exports = {
    login: function(request, callback) {
        setTimeout(function() {
            console.log('login completed');
            callback();
        }, 1000);
    },

    register: function(request, callback) {
        setTimeout(function() {
            console.log('register completed');
            callback();
        })
    }
};