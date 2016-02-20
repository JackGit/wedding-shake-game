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
                    <a href="#" class="brand-logo center">Ranking</a>
                    <ul id="nav-mobile" class="left">
                        <li><a v-link="{name: 'home', params: {userId: currentPlayer.userId}}"><i class="material-icons">open_in_new</i></a></li>
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
                                    <td style="position: relative">WIN<img src="http://img.aiyidu.com/forum/201309/08/192346u5dud4wi14uw1e4w.jpg" class="win-stamp"></td>
                                </tr>
                                <tr>
                                    <td>Groom</td>
                                    <td>{{groomPlayers.length}}</td>
                                    <td>{{groomTotal}}</td>
                                    <td style="position: relative">FAILED</td>
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
            }
        },

        ready: function() {
            var roomId = this.$route.params.roomId;
            store.actions.getRoomPlayers(roomId);
            store.actions.getRoomDetails(roomId);
        },

        route: {
            canActivate: function(transition) {
                var room = store.state.player.currentRoom;

                if(room.status === 'END')
                    transition.next();
                else if(room.status === 'PLAYING')
                    transition.redirect({name: 'visit', params: {roomId: room.objectId}});
                else
                    transition.abort();
            }
        }
    };
</script>