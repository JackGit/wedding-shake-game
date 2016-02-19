<style>

</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a href="#" class="brand-logo">Visit Mode</a>
                    <ul id="nav-mobile" class="left">
                        <li><a v-link="{name: 'home'}"><i class="material-icons">open_in_new</i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="container">
            <div class="row">
                <h6 class="grey-text">STATUS</h6>
                <div class="card">
                    <div class="card-content" v-if="status === 'END'">
                        <h4 class="card-title center-align">Game Ended</h4>
                        <div class="center-align">
                            <a class="waves-effect waves-light btn red lighten-2" v-link="{name: 'ranking', params: {roomId: $route.params.roomId}}">Check Ranking</a>
                        </div>
                    </div>
                    <div class="card-content" v-else>
                        <h4 class="card-title center-align">Game WIP</h4>
                    </div>
                </div>

                <h6 class="grey-text">ROOM INFO</h6>
                <div class="card col s12">
                    <div class="card-content">
                        <div class="col s6 teal-text">
                            <h6 class="center-align text-lighten-3">Bride({{bridePlayers.length}})</h6>
                            <h1 class="center-align">{{brideTotal}}</h1>
                        </div>
                        <div class="col s6 red-text">
                            <h6 class="center-align text-lighten-3">Groom({{groomPlayers.length}})</h6>
                            <h1 class="center-align">{{groomTotal}}</h1>
                        </div>
                    </div>
                </div>

                <h6 class="grey-text">PLAYER DATA</h6>
                <div class="card col s12">
                    <div class="card-content">
                        <ul class="collection">
                            <li class="collection-item avatar" v-for="player in players">
                                <img src="http://materializecss.com/images/yuna.jpg" class="circle">
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
            players: function() {
                return store.state.player.playerList.sort(function(p1, p2) {
                    // descend order
                    return p1.shakeCount < p2.shakeCount;
                });
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
            },
            status: function() {
                return store.state.player.currentRoom.status;
            }
        },

        ready: function() {
            var roomId = this.$route.params.roomId;
            store.actions.getRoomDetails(roomId);
            store.actions.getRoomPlayers(roomId);
            store.actions.listenPlayerShakeSocketMessage(true);
            store.actions.listenPlayerStatusChangeSocketMessage(true);
        }
    };
</script>