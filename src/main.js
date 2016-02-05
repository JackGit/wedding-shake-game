var Vue = require('vue');
var VueResource = require('vue-resource');
var VueRouter = require('vue-router');

Vue.use(VueResource);
Vue.use(VueRouter);

var App = require('./app.vue');
var router = new VueRouter();
var store= require('./store');

var SPA = {
    install: function(Vue, options) {
        Vue.prototype.$callservice = function(url, request, options) {
            store.actions.showMask();
            return new Promise(function(resolve, reject) {
                Vue.http.post(url, request).then(function(response) {
                    store.actions.hideMask();
                    resolve(response);
                }, function(error) {
                    store.actions.hideMask();
                    reject(error);
                });
            });
        };
    }
};

Vue.use(SPA);

router.map({
    '/welcome': {
        name: 'welcome',
        component: require('./components/welcome-page.vue')
    },
    '/interaction': {
        name: 'interaction',
        component: require('./components/interaction-page.vue')
    },
    '/end': {
        name: 'end',
        component: require('./components/end-page.vue')
    }
});

router.redirect({'/': '/welcome'});

router.beforeEach(function(transition) {
    console.log('before each');
    //store.state.app.mask = true;
    transition.next();
});

router.afterEach(function() {
   console.log('after each');
    //store.state.app.mask = false;
});

router.start(App, '#app');