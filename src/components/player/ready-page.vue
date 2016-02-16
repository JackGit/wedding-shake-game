<style scoped>
</style>

<template>
    <div>
        <div>room name: {{room.roomName}}</div>
        <div>room size: {{room.roomSize}}</div>
        <div>
            players: {{gameStatus}}
        </div>
        <div>
            {{shakeCount}}
        </div>
        <div v-for="player in players">
            {{player.userName}}
        </div>
        <button @click="leaveRoom()">Leave</button>
    </div>
</template>

<script>
    var store = require('../../store');

    // threshold = 15, timeout = 100 => 80 times / 10s, for both iphone and android
    var ShakeJS = require('shake.js');
    var shake = null;

    module.exports = {

        computed: {
            room: function() {
                return store.state.player.readyPage.roomDetails;
            },
            players: function() {
                return store.state.player.readyPage.players;
            },
            gameStatus: function() {
                var status = store.state.player.readyPage.gameStatus;

                if(status === 'PLAYING') {
                    console.log('START!!!');
                    this.$router.go({name: 'shake'});
                }

                if(status === 'END')
                    console.log('END!!!');
                return status;
            },
            shakeCount: function() {
                return store.state.player.currentPlayer.shakeCount;
            }
        },

        ready: function() {
            var roomId = this.$route.params.roomId;

            store.actions.getRoomDetails(roomId);
            store.actions.getRoomPlayers(roomId);
            store.actions.clearShakeCount();


            if(shake) {
                shake.stop();
            } else {
                window.addEventListener('shake', function() {
                    store.actions.shake();
                }, false);

                shake = new ShakeJS({
                    threshold: 15,
                    timeout: 100
                });
            }

            shake.start();
        },

        methods: {
            leaveRoom: function() {
                var roomId = this.$route.params.roomId;
                var userId = store.state.player.currentPlayer.userId;
                var router = this.$router;

                store.actions.leaveRoom(roomId, userId).then(function() {
                    router.go({name: 'home', params: {userId: userId}});
                }, function() {

                });

            }
        }
    };
</script>