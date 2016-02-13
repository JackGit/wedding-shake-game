<style scoped>
</style>

<template>
    <div>
        <div>room name: {{room.roomName}}</div>
        <div>room size: {{room.roomSize}}</div>
        <div>
            players: {{gameStatus}}
        </div>
        <div v-for="player in players">
            {{player.userName}}
        </div>
        <button @click="leaveRoom()">Leave</button>
    </div>
</template>

<script>
    var store = require('../../store');

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
            }
        },

        ready: function() {
            var roomId = this.$route.params.roomId;

            store.actions.getRoomDetails(roomId);
            store.actions.getRoomPlayers(roomId);
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