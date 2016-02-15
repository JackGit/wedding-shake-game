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
    '/welcome': {
        name: 'welcome',
        component: require('./components/player/welcome-page.vue')
    },
    '/home/:userId': {
        name: 'home',
        component: require('./components/player/home-page.vue')
    },
    '/ready/:roomId': {
        name: 'ready',
        component: require('./components/player/ready-page.vue')
    },
    '/shake': {
        name: 'shake',
        component: require('./components/player/shake-page.vue')
    },
    '/ranking/:roomId': {
        name: 'ranking',
        component: require('./components/player/ranking-page.vue')
    },
    '/admin': {
        name: 'admin',
        component: require('./components/admin/admin-page.vue')
    },
    '/room/:roomId': {
        name: 'room',
        component: require('./components/admin/room-page.vue')
    }
});

router.redirect({
   '/': '/welcome'
});


router.start(App, '#app');