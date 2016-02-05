<style scoped>

</style>

<template>
    <div>
        lobby page
        <div v-for="player in playerList">
            {{player.userName}}, {{player.shakeCount}}
        </div>
        <button @click="leaveGame()">Leave</button>
        <div>
            <button @click="shake()">Shake {{shakeCount}}</button>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {
        computed: {
            playerList: function() {
                return store.state.playerList.sort(function(p1, p2) {
                    return p1.updatedAt < p2.updatedAt;
                });
            },
            shakeCount: function() {
                return store.state.player.shakeCount;
            }
        },

        ready: function() {
            store.actions.joinGame(this.$route.params.playerId);
        },

        methods: {
            leaveGame: function() {
                store.actions.leaveGame(this.$route.params.playerId);
                this.$router.go({name: 'welcome'});
            },
            shake: store.actions.shake
        },

        route: {
            data: function(transition) {
                store.actions.getPlayerList().then(function() {
                    transition.next();
                }, function(error) {
                    transition.abort();
                });
            }
        }
    }
</script>