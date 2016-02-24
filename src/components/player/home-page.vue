<style scoped>
</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo">{{currentPlayer.userName}}</a>
                    <ul class="right">
                        <li><a v-link="{name:'profile'}"><i class="material-icons fa fa-user"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

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
                    <div class="card-content center-align" v-if="room.status === 'JOINING'">
                        <a @click="join(room.objectId)" class="waves-effect waves-light btn red lighten-2">Join Now</a>
                    </div>
                    <div class="card-content center-align" v-if="room.status === 'PLAYING'">
                        <a @click="visit(room.objectId)" class="waves-effect waves-light btn red lighten-2">Pay Visit</a>
                    </div>
                    <div class="card-content center-align" v-if="room.status === 'END'">
                        <a @click="ranking(room.objectId)" class="waves-effect waves-light btn red lighten-2">Check Rankings</a>
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
                return store.state.player.roomList;
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
                    router.go({name: 'ready'});
                }, function() {

                });
            },
            visit: function(roomId) {
                console.log('visit');
                this.$router.go({name: 'visit', params: {roomId: roomId}});
            },
            ranking: function(roomId) {
                console.log('ranking');
                this.$router.go({name: 'ranking', params: {roomId: roomId}});
            }
        },

        route: {
            canActivate: function(transition) {
                var userId = store.state.player.currentPlayer.objectId;

                store.actions.getUserDetails(userId).then(function() {
                    transition.next();
                }, function() {
                    console.log('home-page validate user failed, redirect to welcome page, userId', userId);
                    transition.redirect({name: 'welcome'});
                });
            }
        }
    }
</script>