<template>
    <div @click="back()">ranking page</div>
</template>

<script>
    var store = require('../../store');

    module.exports = {

        methods: {
            back: function() {
                this.$router.go({name: 'home', params: {userId: store.state.player.currentPlayer.userId}});
            }
        }
    };
</script>