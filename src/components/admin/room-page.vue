<style>

</style>

<template>
    <div>
        room page: {{room.roomName}}
        players: {{players.length}}
        <div>
            <button @click="allowToJoin()">Allow To Join</button>
            <button @click="start()">Start</button>
            <button @click="stop()">Stop</button>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {

        computed: {
            room: function() {
                return store.state.admin.roomPage.roomDetails;
            },
            players: function() {
                return store.state.admin.roomPage.players;
            }
        },

        ready: function() {
            store.actions.getAdminRoomDetails(this.$route.params.roomId);
            store.actions.getAdminRoomPlayers(this.$route.params.roomId);
        },

        methods: {
            allowToJoin: function() {
                store.actions.allowToJoinRoom(this.$route.params.roomId);
            },
            start: function() {
                store.actions.startRoom(this.$route.params.roomId);
            },
            stop: function() {
                store.actions.stopRoom(this.$route.params.roomId);
            }
        }
    };
</script>