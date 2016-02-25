<style>
    .mask {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0,0,0,0.5);
    }

    .fade-transition {
        transition: all 0.2s ease;
    }

    .fade-enter {
        opacity: 0;
        /*margin-top: 5%;*/
    }

    .fade-leave {
        opacity: 0;
    }
</style>

<template>
    <div>
        <router-view transition="fade" transition-mode="out-in"></router-view>
        <div class="mask" v-if="mask"></div>
    </div>
</template>

<script>
    var store = require('./store');

    module.exports = {
        components: {

        },

        computed: {
            mask: function() {
                return store.state.mask;
            }
        }
    }
</script>