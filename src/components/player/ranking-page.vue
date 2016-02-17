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
        <nav>
            <div class="nav-wrapper red lighten-2">
                <a href="#" class="brand-logo">Ranking</a>
                <ul id="nav-mobile" class="left">
                    <li><a v-link="{name: 'home', params: {userId: currentPlayer.userId}}"><i class="material-icons">open_in_new</i></a></li>
                </ul>
            </div>
        </nav>

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
                                    <td>5</td>
                                    <td>32</td>
                                    <td style="position: relative">WIN<img src="http://img.aiyidu.com/forum/201309/08/192346u5dud4wi14uw1e4w.jpg" class="win-stamp"></td>
                                </tr>
                                <tr>
                                    <td>Groom</td>
                                    <td>4</td>
                                    <td>30</td>
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
                                <div class="progress">
                                    <div class="determinate" :style="{width: player.shakeCount/200*100 + '%'}"></div>
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
                return store.state.player.rankingPage.players.sort(function(p1, p2) {
                    // descend order
                    return p1.shakeCount < p2.shakeCount;
                });
            }
        }
    };
</script>