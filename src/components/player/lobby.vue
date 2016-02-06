<style scoped>
    .line {
        background: red;
        display: inline-block;
        height: 2px;
        width: 0%;
        transition: width 0.5s ease;
    }
</style>

<template>
    <div>
        <div>current player: {{currentPlayer.userName}}</div>
        <div>you just shaked: {{currentPlayer.shakeCount}}</div>

        <h4>other players: </h4>
        <div v-for="player in playerList">
            {{player.userName}}, {{player.shakeCount}}
            <div class="line" :style="{width: player.shakeCount + '%'}"></div>
        </div>

        <div>
            <button @click="leaveGame()">Leave</button>
            <button @click="shake()">Shake</button>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');
    var ShakeJS = require('shake.js');
    var shake = null;

    module.exports = {
        computed: {
            playerList: function() {
                var currentUserId = this.$route.params.playerId;

                return store.state.playerList.filter(function(p) {
                    return p.objectId !== currentUserId;
                }).sort(function(p1, p2) {
                    return p1.updatedAt < p2.updatedAt;
                });
            },
            currentPlayer: function() {
                return store.state.currentPlayer;
            }
        },

        ready: function() {
            store.actions.joinGame(this.$route.params.playerId);

            if(!shake) {
                shake = new ShakeJS({
                    threshold: 15,
                    timeout: 100
                });

                window.addEventListener('shake', function() {
                    store.actions.shake();
                }.bind(this), false);

                shake.start();
            }

            console.log('component ready');
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
                // this part of code won't run if you directly input the url in the browser or refresh the page
                /*store.actions.getPlayerList().then(function() {
                    transition.next();
                }, function(error) {
                    transition.abort();
                });*/
                console.log('route.data');
                transition.next();
            },
            activate: function(transition) {
                console.log('route.activate');
                transition.next();
            },
            deactivate: function(transition) {
                store.actions.leaveGame(this.$route.params.playerId);
                transition.next();
            }
        }
    }
</script>