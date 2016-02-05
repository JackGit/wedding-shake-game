var Vue = require('vue');
var Vuex = require('vuex').default;

Vue.use(Vuex);
Vue.config.debug = true;

/**
 * refer SAO: com.citi.sao.XXXComponent = {}; to manage state and related actions for different pages
 */
module.exports = window.store = new Vuex.Store({
    state: {
        app: {
            mask: false
        },
        interactionPage: {
            message: ''
        },
        welcomePage: {
            message: ''
        },
        pages: {
            interaction: {
                message: ''
            },
            welcome: {
                message: ''
            }
        }
    },
    actions: {
        showMask: function(store) {
            store.dispatch('SHOW_MASK');
        },
        hideMask: function(store) {
            store.dispatch('HIDE_MASK');
        },
        loadWelcomePageData: function(store, request) {
            store.state.app.mask = true;
            setTimeout(function() {
                store.dispatch('LOAD_WELCOME_PAGE_DATA', 'welcome page data');
                store.state.app.mask = false;
            }, 1000);

        },
        loadPageData: function(store, name, query) {
            console.log('store.actions.loadPageData', name, query);
            return new Promise(function(resolve) {
                store.actions.showMask();
                setTimeout(function() {
                    store.dispatch('INIT_PAGE_DATA', name, query);
                    resolve();
                    store.actions.hideMask();
                }, 1000);
            });

        },
        loadInteractionPageData: function(store, request, showMask) {
            /*store.state.app.mask = true;

            setTimeout(function() {
                store.dispatch('LOAD_INTERACTION_PAGE_DATA', 'loaded data for interaction page');
                store.state.app.mask = false;
            }, 2000);*/

            return new Promise(function(resolve) {
                store.state.app.mask = true;
                console.log('promise working on it');
                setTimeout(function() {
                    store.dispatch('LOAD_INTERACTION_PAGE_DATA', 'loaded data for interaction page');
                    store.state.app.mask = false;
                    console.log('promise returned');
                    resolve();
                }, 2000);

            });
        }
    },
    mutations: {
        SHOW_MASK: function(state) {
            state.app.mask = true;
        },
        HIDE_MASK: function(state) {
            state.app.mask = false;
        },
        LOAD_INTERACTION_PAGE_DATA: function(state, message) {
            state.interactionPage.message = message;
        },
        LOAD_WELCOME_PAGE_DATA: function(state, message) {
            state.welcomePage.message = message;
        },
        INIT_PAGE_DATA: function(state, page, data) {
            state.pages[page] = data;
        }
    }
});
