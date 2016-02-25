<style scoped>
    .win-stamp {
        width: 40px;
        position: absolute;
        top: -5px;
        right: -5px;
        -webkit-transform: rotate(30deg);
        border-radius: 50%;
    }
</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo center">Ranking</a>
                    <ul class="left">
                        <li><a v-link="{name:'home'}"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="container">
            <div class="row">
                <h6 class="grey-text">RESULT</h6>
                <div class="card col s12">
                    <div class="card-content">
                        <table>
                            <thead>
                                <tr>
                                    <th data-field="side">Side</th>
                                    <th data-field="players">Players</th>
                                    <th data-field="total">Total</th>
                                    <th data-field="result">Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Bride</td>
                                    <td>{{bridePlayers.length}}</td>
                                    <td>{{brideTotal}}</td>
                                    <td v-if="brideTotal > groomTotal" style="position: relative">WIN<img :src="winImageUrl" class="win-stamp"></td>
                                    <td v-else style="position: relative">FAILED</td>
                                </tr>
                                <tr>
                                    <td>Groom</td>
                                    <td>{{groomPlayers.length}}</td>
                                    <td>{{groomTotal}}</td>
                                    <td v-if="brideTotal < groomTotal" style="position: relative">WIN<img :src="winImageUrl" class="win-stamp"></td>
                                    <td v-else style="position: relative">FAILED</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <h6 class="grey-text">DETAILS</h6>
                <div class="card col s12">
                    <div class="card-content">
                        <ul class="collection">
                            <li class="collection-item avatar" v-for="player in players">
                                <img :src="player.avatarImageUrl" class="circle">
                                <span class="title">{{player.userName}}<span class="badge">{{player.shakeCount}}</span></span>
                                <div class="progress" v-if="player.userType === 'BRIDE'">
                                    <div class="determinate" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                                </div>
                                <div class="progress red lighten-4" v-if="player.userType === 'GROOM'">
                                    <div class="determinate red" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                                </div>
                                <p>{{player.userType}}</p>
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
        data: function() {
            return {
                winImageUrl: 'static/images/win_stamp.jpg'
            }
        },

        computed: {
            currentPlayer: function() {
                return store.state.player.currentPlayer;
            },
            players: function() {
                var ranking = store.state.player.currentRoom.ranking || [];
                var players = [];

                ranking.forEach(function(r) {
                    var player = store.state.player.rankingPage.playerList.filter(function(p) {
                        return p.objectId === r.playerId;
                    })[0];
                    // after generate ranking in server side, user.shakeCount will be reset as 0;
                    if(player) {
                        player.shakeCount = r.shakeCount;
                        players.push(player);
                    }
                });

                if(players.length === 0)
                    return players;
                else
                    return players.sort(function(p1, p2) {
                        // descend order
                        return p1.shakeCount < p2.shakeCount;
                    });
            },
            bridePlayers: function() {
                var ranking = store.state.player.currentRoom.ranking || [];
                var players = [];

                ranking.forEach(function(r) {
                    var p = store.state.player.rankingPage.playerList.filter(function(p) {
                        return p.objectId === r.playerId && p.userType === 'BRIDE';
                    })[0];

                    p && players.push(p);
                });
                return players;
            },
            groomPlayers: function() {
                var ranking = store.state.player.currentRoom.ranking || [];
                var players = [];

                ranking.forEach(function(r) {
                    var p = store.state.player.rankingPage.playerList.filter(function(p) {
                        return p.objectId === r.playerId && p.userType === 'GROOM';
                    })[0];

                    p && players.push(p);
                });
                return players;
            },
            brideTotal: function() {
                var total = 0;
                (store.state.player.currentRoom.ranking || []).forEach(function(r) {
                    if(r.playerType === 'BRIDE')
                        total += r.shakeCount;
                });
                return total;
            },
            groomTotal: function() {
                var total = 0;
                (store.state.player.currentRoom.ranking || []).forEach(function(r) {
                    if(r.playerType === 'GROOM')
                        total += r.shakeCount;
                });
                return total;
            }
        },

        ready: function() {
            var roomId = this.$route.params.roomId;
            store.actions.getRoomDetails(roomId);
            store.actions.getRoomRankingPlayers(roomId);
        }
    };
</script>