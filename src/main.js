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
    '/login': {
        name: 'login',
        component: require('./components/player/login-page.vue')
    },
    '/home': {
        name: 'home',
        component: require('./components/player/home-page.vue')
    },
    '/profile': {
        name: 'profile',
        component: require('./components/player/profile-page.vue')
    },

    // pages after join room start
    // refresh these pages will route to home page
    '/ready': {
        name: 'ready',
        component: require('./components/player/ready-page.vue')
    },
    '/shake': {
        name: 'shake',
        component: require('./components/player/shake-page.vue')
    },
    // pages after join room end

    '/ranking/:roomId': {
        name: 'ranking',
        component: require('./components/player/ranking-page.vue')
    },
    '/visit/:roomId': {
        name: 'visit',
        component: require('./components/player/visit-page.vue')
    }

    // admin pages
    /*
    '/admin': {
        name: 'admin',
        component: require('./components/admin/home-page.vue')
    },
    '/room/:roomId': {
        name: 'room',
        component: require('./components/admin/room-page.vue')
    }*/
});

router.redirect({
   '/': '/login'
});


router.start(App, '#app');