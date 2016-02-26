<style scoped>
    .ready-page-image {
        width: 100%;
        height: 100%;
        background-image: url(http://hlynnphoto.com/assets/img/category-portrait.jpg);
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
                    <a class="brand-logo center">Ready Page</a>
                    <ul class="left">
                        <li><a @click="back()"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="slider-container">
            <div class="ready-page-image">
                <div class="card col s12 no-shadow transparent white-text" style="margin-top:0">
                    <div class="card-content">
                        <span class="card-title">room info</span>
                        <p>All players shake mobile for 30 seconds, total of shake count of which side is bigger, is the winner.</p>
                    </div>
                </div>
            </div>
        </div>

        <ul class="tabs" v-el:tabs>
            <li class="tab col s6"><a href="#brideTab" :class="currentPlayer.userType === 'BRIDE' ? 'active' : ''">Bride ({{bridePlayers.length}}/{{room.roomSize}})</a></li>
            <li class="tab col s6"><a href="#groomTab" :class="currentPlayer.userType === 'GROOM' ? 'active' : ''">Groom ({{groomPlayers.length}}/{{room.roomSize}})</a></li>
        </ul>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>JOINED PLAYERS</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border" id="brideTab">
                    <li class="collection-item avatar" v-for="player in bridePlayers">
                        <img :src="player.avatarImageUrl" class="circle">
                        <span class="title">{{player.userName}}</span>
                        <p>joined 5 mins ago</p>
                    </li>
                </ul>
                <ul class="collection no-border transparent" id="groomTab">
                    <li class="collection-item avatar" v-for="player in groomPlayers">
                        <img :src="player.avatarImageUrl" class="circle">
                        <span class="title">{{player.userName}}</span>
                        <p>joined 5 mins ago</p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');
    var Stopwatch = require('timer-stopwatch');

    module.exports = {

        computed: {
            room: function() {
                return store.state.player.currentRoom;
            },
            currentPlayer: function() {
                return store.state.player.currentPlayer;
            },
            bridePlayers: function() {
                return store.state.player.playerList.filter(function(player) {
                    return player.userType === 'BRIDE';
                });
            },
            groomPlayers: function() {
                return store.state.player.playerList.filter(function(player) {
                    return player.userType === 'GROOM';
                });
            },
            status: function() {
                return store.state.player.currentRoom.status;
            }
        },

        watch: {
            'status': function(value, oldValue) {
                console.log('game status change from ' + oldValue + ' to ' + value);
                switch(value) {
                    case 'PLAYING':
                        store.actions.updateStopwatch(store.state.player.shakePage.TOTAL_GAME_TIME);
                        this.start();
                        break;
                    case 'END':
                        break;
                    default:
                        break;
                }
            }
        },

        ready: function() {
            $(this.$els.tabs).tabs();

            var roomId = store.state.player.currentRoom.objectId;

            store.actions.getRoomDetails(roomId);
            store.actions.getRoomPlayers(roomId);

            store.actions.listenPlayerJoinSocketMessage(true);
            store.actions.listenPlayerLeaveSocketMessage(true);
            store.actions.listenPlayerStatusChangeSocketMessage(true);
        },

        methods: {
            leaveRoom: function() {
                var roomId = store.state.player.currentRoom.objectId;
                var userId = store.state.player.currentPlayer.objectId;
                var router = this.$router;

                store.actions.leaveRoom(roomId, userId).then(function() {
                    router.go({name: 'home'});
                }, function() {

                });
            },
            start: function() {
                var router = this.$router;
                var timer = new Stopwatch(3000, {refreshRateMS: 1000});
                var count = 3;

                Materialize.toast('Are you ready? We are about to start', 1500);

                timer.onTime(function() {
                    if(count > 0)
                        Materialize.toast('Counting down ' + count, 700);
                    if(count === 0)
                        Materialize.toast('Here we go!', 700);
                    count --;
                });
                timer.onDone(function() {
                    router.go({name: 'shake'});
                });

                setTimeout(function() {
                    timer.start();
                }, 2000);
            },
            back: function() {
                this.leaveRoom();
            }
        },

        route: {
            canActivate: function(transition) {
                var roomId = store.state.player.currentRoom.objectId;

                if(roomId)
                    transition.next();
                else
                    transition.redirect({name: 'home'});
            }
        }
    };
</script>