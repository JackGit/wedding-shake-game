var Vue = require('vue');
var VueResource = require('vue-resource');
var VueRouter = require('vue-router');

Vue.use(VueResource);
Vue.use(VueRouter);

var App = require('./app-admin.vue');
var router = new VueRouter();
var store = require('./store/admin.js');

var socket = io();
window.socket = socket;

router.map({
    '/login': {
        name: 'login',
        component: require('./components/admin/login-page.vue')
    },
    '/home': {
        name: 'home',
        component: require('./components/admin/home-page.vue')
    },
    '/room/:roomId': {
        name: 'room',
        component: require('./components/admin/room-page.vue')
    },
    '/room/:roomId/edit': {
        name: 'room-edit',
        component: require('./components/admin/room-edit-page.vue')
    },
    '/room/create': {
        name: 'room-create',
        component: require('./components/admin/room-create-page.vue')
    }
});

router.redirect({
   '/': '/login'
});


router.start(App, '#app');