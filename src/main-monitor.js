var Vue = require('vue');
var VueResource = require('vue-resource');
var VueRouter = require('vue-router');

Vue.use(VueResource);
Vue.use(VueRouter);
Vue.use(require('vue-animated-list'));

var App = require('./app-monitor.vue');
var router = new VueRouter();
var store = require('./store/monitor.js');

var socket = io();
window.socket = socket;

router.map({
    '/': {
        name: 'home',
        component: require('./components/monitor/home-page.vue')
    }
});


router.start(App, '#app');