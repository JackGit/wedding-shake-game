<style scoped>
</style>

<template>
    <div>
        {{currentPlayer.userName}}'s home page
        <ul>
            <li v-for="room in roomList">
                <p>name: {{room.roomName}}</p>
                <p>status: {{room.status}}</p>
                <p>players: {{room.players.length}}</p>
                <button @click="join(room.objectId)">{{room.status === 'JOINING' ? 'Join' : 'Visit as guest'}}</button>
            </li>
        </ul>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {

        computed: {
            currentPlayer: function() {
                return store.state.player.currentPlayer;
            },
            roomList: function() {
                return store.state.player.homePage.roomList;
            }
        },

        ready: function() {
            store.actions.getRoomList();
        },

        methods: {
            join: function(roomId) {
                var router = this.$router;

                store.actions.joinRoom({
                    user: store.state.player.currentPlayer,
                    roomId: roomId
                }).then(function() {
                    router.go({name: 'ready', params: {roomId: roomId}});
                }, function() {

                });
            }
        },

        route: {
            data: function(transition) {
                var userId = this.$route.params.userId;

                // validate the user by userId
                // if user is not valid, clear user data and return to welcome page
                store.actions.getUserDetails(userId).then(function(user) {
                    transition.next();
                }, function(error) {
                    console.log('home-page validate user failed, redirect to welcome page, userId', userId);
                    store.actions.clearUserData();
                    transition.redirect({name: 'welcome'});
                });
            }
        }
    }
</script>