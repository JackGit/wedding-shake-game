<style scoped>
    .home-page-image {
        width: 100%;
        height: 100%;
        background-image: url(http://hlynnphoto.com/assets/img/category-engagement.jpg);
        background-repeat: no-repeat;
        -webkit-background-size: cover;
        background-size: cover;
        background-position: center center;
    }

</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo center">{{currentPlayer.userName}}</a>
                    <ul class="right">
                        <li><a @click="quit()"><i class="material-icons fa fa-sign-out"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="slider-container">
            <div class="home-page-image"></div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>USER INFORMATION</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card no-shadow">
                    <div class="card-content row" style="margin-bottom:0">
                        <div class="col s3">
                            <img :src="currentPlayer.avatarImageUrl" alt="" class="circle responsive-img">
                        </div>
                        <div class="col s7">
                            <h6>{{currentPlayer.userName}}</h6>
                            <span style="color: #A9A7A7">{{currentPlayer.userType}} Guest</span>
                        </div>
                        <div class="col s2">
                            <h5><a v-link="{name:'profile'}"><i class="material-icons fa fa-edit"></i></a></h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>ROOM LIST</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border transparent">
                    <li class="collection-item avatar" v-for="room in roomList">
                        <i v-if="$index == 0" class="material-icons circle" style="background: #90dde3">{{$index + 1}}</i>
                        <i v-if="$index == 1" class="material-icons circle" style="background: #f79a3d">{{$index + 1}}</i>
                        <i v-if="$index == 2" class="material-icons circle" style="background: #f56937">{{$index + 1}}</i>
                        <div class="row">
                            <span class="title red-text text-lighten-2">{{room.roomName}}</span>
                            <p v-if="room.status === 'INIT'">Game is not started yet, please wait.</p>
                            <p v-if="room.status === 'JOINING'">People are joining, there are {{room.players.length}} players joined the game.</p>
                            <p v-if="room.status === 'PLAYING'">Game is playing right now. You can't join right now.</p>
                            <p v-if="room.status === 'END'">Game is ended.</p>
                        </div>
                        <div class="row">
                            <a v-if="room.status === 'JOINING'" @click="join(room.objectId)" class="waves-effect waves-light btn red lighten-2">Join Now</a>
                            <a v-if="room.status === 'PLAYING'" @click="visit(room.objectId)" class="waves-effect waves-light btn white red-text">Pay Visit</a>
                            <a v-if="room.status === 'END'" @click="ranking(room.objectId)" class="waves-effect waves-light btn white red-text">Check Rankings</a>
                        </div>
                    </li>
                </ul>
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
            },
            quit: function() {
                store.actions.signout();
                this.$router.go({name: 'login'});
            },
        },

        route: {
            canActivate: function(transition) {
                var userId = store.state.player.currentPlayer.objectId;

                store.actions.getUserDetails(userId).then(function() {
                    transition.next();
                }, function() {
                    console.log('home-page validate user failed, redirect to welcome page, userId', userId);
                    transition.redirect({name: 'login'});
                });
            }
        }
    }
</script>