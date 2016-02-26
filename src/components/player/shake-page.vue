<style scoped>
    .shake-page-unit {
        font-size: 20px;
    }
    .shake-page-image {
        width: 100%;
        height: 100%;
        background-color: #E57373;
        /*background-image: url(http://hlynnphoto.com/assets/img/category-portrait.jpg);*/
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
                    <a class="brand-logo center">Shaking</a>
                </div>
            </nav>
        </div>

        <div class="slider-container">
            <div class="shake-page-image">
                <div class="card col s12 no-shadow transparent white-text" style="margin-top:0">
                    <div class="card-content">
                        <h1 class="center-align white-text">{{shakeCount}}<span class="shake-page-unit">times</span></h1>
                    </div>
                </div>
            </div>
        </div>

        <div class="section" v-if="!shakeCompleted">
            <div class="section-header">
                <div class="container">
                    <h6>TIME</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card no-shadow">
                    <div class="card-content">
                        <h4 class="center-align red-text">{{stopwatchString}}<i class="material-icons shake-page-unit fa fa-clock-o"></i></h4>
                    </div>
                </div>
            </div>
        </div>

        <div class="section" v-if="shakeCompleted">
            <div class="section-header">
                <div class="container">
                    <h6>YOUR RESULT</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card no-shadow">
                    <div class="card-content">
                        <h4 class="card-title center-align">GAME END~</h4>
                        <p>Congratulations! You just shaked <span class="teal-text" style="font-size: 1.5em">{{shakeCount}}</span> times in last <span class="red-text" style="font-size: 1.5em">{{time / 1000}}</span> seconds!</p>
                    </div>
                    <div class="card-content red lighten-3 white-text">
                        a chart here
                    </div>
                    <div class="card-content center-align">
                        <a class="waves-effect waves-light btn red lighten-2" v-link="{name: 'ranking', params: {roomId: room.objectId}}">Check Ranking</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>OTHER</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border">
                    <li class="collection-item avatar" v-for="player in players">
                        <img :src="player.avatarImageUrl" class="circle">
                        <span class="title">{{player.userName}}<span class="badge">{{player.shakeCount}}</span></span>
                        <div class="progress" v-if="player.userType === 'BRIDE'">
                            <div class="determinate" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                        </div>
                        <div class="progress red lighten-4" v-if="player.userType === 'GROOM'">
                            <div class="determinate red" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                        </div>
                        <p>{{player.userType}} side</p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');
    var Stopwatch = require('timer-stopwatch');
    var ShakeJS = require('shake.js'); // threshold = 15, timeout = 100 => 80 times / 10s, for both iphone and android
    var GAME_TIME = 20 * 1000;
    var shake = null;
    var timer = null;

    module.exports = {

        data: function() {
            return {
                time: GAME_TIME
            };
        },

        computed: {
            shakeCount: function() {
                return store.state.player.currentPlayer.shakeCount;
            },
            room: function() {
                return store.state.player.currentRoom;
            },
            players: function() {
                return store.state.player.playerList.filter(function(p) {
                    return p.objectId !== store.state.player.currentPlayer.objectId;
                });
            },
            shakeCompleted: function() {
                return store.state.player.shakePage.timeBalance <= 0;
            },
            stopwatchString: function() {
                return store.state.player.shakePage.stopwatchString;
            }
        },

        ready: function() {
            var unit = store.state.player.shakePage.STOPWATCH_UNIT;
            var total = store.state.player.shakePage.timeBalance;

            /** init shake **/
            shake = new ShakeJS({
                threshold: 15,
                timeout: 100
            });
            window.addEventListener('shake', store.actions.shake, false);

            /** init timer **/
            // total, by default would be 20 * 1000
            // if the first time to get shake page, the total would be 20 * 1000
            // if shake started, time will be counting down until total = 0
            // if shake not done, and user moves to other page, and move back again, and total > 0, will count again
            if(total > 0) {
                timer = new Stopwatch(total, {refreshRateMS: unit});

                timer.onTime(function() {
                    if(total > 0)
                        store.actions.updateStopwatch(total);

                    total -= unit;
                });

                timer.onDone(function() {
                    shake.stop();
                    store.actions.updateStopwatch(0);
                });

                timer.start();
                shake.start();
            }

            store.actions.listenPlayerShakeSocketMessage(true);
        },

        beforeDestroy: function() {
            shake.stop();
            shake = null;
            window.removeEventListener('shake', store.actions.shake);
        },

        route: {
            canActivate: function(transition) {
                var room = store.state.player.currentRoom;

                if(room.objectId) {
                    if(room.status !== 'PLAYING')
                        transition.redirect({name: 'ready'});
                    else
                        transition.next();

                } else
                    transition.redirect({name: 'home'});
            }
        }
    };
</script>