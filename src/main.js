var Vue = require('vue');
var VueResource = require('vue-resource');
var VueRouter = require('vue-router');

Vue.use(VueResource);
Vue.use(VueRouter);

var App = require('./app.vue');
var router = new VueRouter();
var store = require('./store');

var socket = io();
window.socket = socket;

// add for socket support.
// io is a global variable while include socket.io.js
/* Vue.use({
    install: function(Vue) {
        if(io)
            Vue.prototype.$socket = socket;
        else
            console.error('init $socket failed');
    }
});*/

router.map({
    '/player': {
        name: 'welcome',
        component: require('./components/player/welcome.vue')
    },
    '/player/:playerId': {
        name: 'lobby',
        component: require('./components/player/lobby.vue')
    },
    '/dashboard': {
        name: 'dashboard',
        component: require('./components/dashboard/dashboard.vue')
    }
});

router.redirect({
   '/': '/player'
});


router.start(App, '#app');