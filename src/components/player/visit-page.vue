<style>

</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo center">旁观模式</a>
                    <ul class="left">
                        <li><a v-link="{name: 'home'}"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="slider-container" v-el:slider-container>
            <div class="card col s12 no-shadow transparent white-text" style="margin-top:0;position:relative;z-index:2">
                <div class="card-content"><span class="card-title">{{currentRoom.roomName}}</span>
                    <p>游戏正在进行中，您处于旁观模式</p>
                    <!--<p>男方共参与人数：{{groomPlayers.length}}</p>
                    <p>女方共参与人数：{{bridePlayers.length}}</p>-->
                </div>
            </div>
        </div>
<!--
        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>基本信息</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card col s12 no-shadow">
                    <div class="card-content row">
                        <div class="col s6 teal-text">
                            <h6 class="center-align text-lighten-3">男方({{groomPlayers.length}}人)</h6>
                            <h1 class="center-align">{{groomTotal}}</h1>
                        </div>
                        <div class="col s6 red-text">
                            <h6 class="center-align text-lighten-3">女方({{bridePlayers.length}}人)</h6>
                            <h1 class="center-align">{{brideTotal}}</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
-->
        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>参与宾客（{{players.length}}）</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border">
                    <li class="collection-item avatar" v-for="player in players">
                        <img :src="player.avatarImageUrl" class="circle">
                        <span class="title">{{player.userName}}<span class="badge">{{player.shakeCount}}</span></span>
                        <div class="progress" v-if="player.userType === 'GROOM'">
                            <div class="determinate" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                        </div>
                        <div class="progress red lighten-4" v-if="player.userType === 'BRIDE'">
                            <div class="determinate red" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                        </div>
                        <p v-if="player.userType === 'GROOM'" class="guest-type-text">男方宾客</p>
                        <p v-if="player.userType === 'BRIDE'" class="guest-type-text">女方宾客</p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');
    var Loader = wy.base.Loader;

    module.exports = {

        computed: {
            currentPlayer: function() {
                return store.state.player.currentPlayer;
            },
            currentRoom: function() {
                return store.state.player.currentRoom;
            },
            players: function() {
                return store.state.player.playerList.sort(function(p1, p2) {
                    // descend order
                    return p1.shakeCount < p2.shakeCount;
                });
            },
            /*bridePlayers: function() {
                return store.state.player.playerList.filter(function(player) {
                    return player.userType === 'BRIDE';
                });
            },
            groomPlayers: function() {
                return store.state.player.playerList.filter(function(player) {
                    return player.userType === 'GROOM';
                });
            },
            brideTotal: function() {
                var total = 0;
                store.state.player.playerList.forEach(function(player) {
                    if(player.userType === 'BRIDE')
                        total += player.shakeCount;
                });
                return total;
            },
            groomTotal: function() {
                var total = 0;
                store.state.player.playerList.forEach(function(player) {
                    if(player.userType === 'GROOM')
                        total += player.shakeCount;
                });
                return total;
            },*/
            status: function() {
                return store.state.player.currentRoom.status;
            }
        },

        ready: function() {
            var loader = new Loader();
            var sliderContainer = this.$els.sliderContainer;

            loader.add('background', 'static/images/wedding_pic_16.jpg', function(r) {
                applySliderImageTilting(sliderContainer, r.data);
            });

            loader.load();

            var roomId = this.$route.params.roomId;
            store.actions.getRoomDetails(roomId);
            store.actions.getRoomPlayers(roomId);
            store.actions.listenPlayerShakeSocketMessage(true);
            store.actions.listenPlayerStatusChangeSocketMessage(true);
        }
    };
</script>