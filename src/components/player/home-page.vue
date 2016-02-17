<style scoped>
</style>

<template>
    <div>
        <nav>
            <div class="nav-wrapper red lighten-2">
                <a href="#" class="brand-logo">{{currentPlayer.userName}}</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li><a href="sass.html">Sass</a></li>
                    <li><a href="badges.html">Components</a></li>
                    <li><a href="collapsible.html">JavaScript</a></li>
                </ul>
            </div>
        </nav>

        <div class="container">
            <div class="row">
                <div class="card col s12" v-for="room in roomList">
                    <div class="card-content">
                        <span class="card-title red-text text-lighten-2">{{room.roomName}}</span>
                        <p v-if="room.status === 'INIT'">Game is not started yet, please wait.</p>
                        <p v-if="room.status === 'JOINING'">People are joining, there are {{room.players.length}} players joined the game.</p>
                        <p v-if="room.status === 'PLAYING'">Game is playing right now. You can't join right now.</p>
                        <p v-if="room.status === 'END'">Game is ended.</p>
                    </div>
                    <div class="card-action" v-if="room.status === 'JOINING'">
                        <a @click="join(room.objectId)" class="waves-effect waves-red btn-flat">Join Now</a>
                    </div>
                    <div class="card-action" v-if="room.status === 'PLAYING'">
                        <a @click="visit(room.objectId)" class="waves-effect waves-red btn-flat">Pay Visit</a>
                    </div>
                    <div class="card-action" v-if="room.status === 'END'">
                        <a @click="ranking(room.objectId)" class="waves-effect waves-red btn-flat">Check Rankings</a>
                    </div>
                </div>
            </div>
        </div>
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
            store.actions.clearShakeCount();
            store.actions.listenPlayerStatusChangeSocketMessage(true);
        },

        methods: {
            join: function(roomId) {
                console.log('join', roomId);
                var router = this.$router;

                store.actions.joinRoom({
                    user: store.state.player.currentPlayer,
                    roomId: roomId
                }).then(function() {
                    router.go({name: 'ready', params: {roomId: roomId}});
                }, function() {

                });
            },
            visit: function(roomId) {
                console.log('visit');
            },
            ranking: function(roomId) {
                console.log('ranking');
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