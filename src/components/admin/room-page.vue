<style scoped>
    .room-edit-button {
        margin: 20px;
    }
</style>

<template>
    <div>
        <div class="card blue-grey darken-1">
            <a class="waves-effect btn right white black-text room-edit-button"><i class="material-icons left">edit</i>edit</a>
            <div class="card-content white-text">
                <span class="card-title">{{room.roomName}} ({{room.status}})</span>
                <p>{{room.roomDescription}}</p>
                <p>size: {{room.roomSize}}</p>
            </div>
        </div>

        <div class="card">
            <div class="card-content">
                
            </div>
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