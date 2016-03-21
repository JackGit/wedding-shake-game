<style scoped>
    .win-stamp {
        width: 1.4em;
        vertical-align: middle;
    }

    .ranking-text {
        font-size: 0.8em;
        font-style: italic;
    }
</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo center">排行</a>
                    <ul class="left">
                        <li><a v-link="{name:'home'}"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="slider-container" v-el:slider-container>
            <div class="card col s12 no-shadow transparent white-text" style="margin-top:0;position:relative;z-index:2">
                <div class="card-content">
                    <span class="card-title">排行榜</span>
                    <p>{{currentRoom.roomName}}</p>
                </div>
            </div>
        </div>

        <div class="section" v-if="currentRoom.status === 'PLAYING'">
            <div class="section-header">
                <div class="container">
                    <h6>信息</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card col s12 no-shadow">
                    <div class="card-content">
                        <p>排行还未生成，请等待主持人结束游戏后生成排行榜</p>
                    </div>
                    <div class="card-content center-align">
                        <a class="waves-effect waves-light btn red lighten-2" @click="reload">刷新</a>
                    </div>
                </div>
            </div>
        </div>

        <div :style="{display: currentRoom.status === 'END' ? '' : 'none'}">
            <!--
            <ul class="tabs" v-el:tabs>
                <li class="tab col s6"><a href="#resultTab" class="active">结果</a></li>
                <li class="tab col s6"><a href="#detailsTab">详细</a></li>
            </ul>
            -->
            <!--<div class="section" id="resultTab">
                <div class="section-header">
                    <div class="container">
                        <h6>结果</h6>
                    </div>
                </div>
                <div class="section-content">
                    <div class="card col s12 no-shadow">
                        <div class="card-content">
                            <table>
                                <thead>
                                <tr>
                                    <th data-field="side">男/女方</th>
                                    <th data-field="players">人数</th>
                                    <th data-field="total">总计</th>
                                    <th data-field="result">结果</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>男方</td>
                                    <td>{{groomPlayers.length}}</td>
                                    <td>{{groomTotal}}</td>
                                    <td v-if="brideTotal < groomTotal" style="position: relative">胜利<img :src="winStampImgUrl" class="win-stamp"></td>
                                    <td v-if="brideTotal == groomTotal" style="position: relative">平局</td>
                                    <td v-if="brideTotal > groomTotal" style="position: relative">失败</td>
                                </tr>
                                <tr>
                                    <td>女方</td>
                                    <td>{{bridePlayers.length}}</td>
                                    <td>{{brideTotal}}</td>
                                    <td v-if="brideTotal > groomTotal" style="position: relative">胜利<img :src="winStampImgUrl" class="win-stamp"></td>
                                    <td v-if="brideTotal == groomTotal" style="position: relative">平局</td>
                                    <td v-if="brideTotal < groomTotal" style="position: relative">失败</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>-->

            <div class="section">
                <div class="section-header">
                    <div class="container">
                        <h6>我的名次</h6>
                    </div>
                </div>
                <div class="section-content">
                    <ul class="collection no-border">
                        <li class="collection-item avatar">
                            <img :src="currentPlayer.avatarImageUrl" class="circle">
                            <span class="title">{{currentPlayer.userName}}
                                <span class="ranking-text grey-text"> 第<span class="red-text">{{myRanking}}</span>名</span>
                                <img v-el:win-stamp v-if="myRankingImgUrl" :src="myRankingImgUrl" class="win-stamp">
                                <span class="badge">{{myShakeCount}}</span>
                            </span>
                            <div class="progress" v-if="currentPlayer.userType === 'GROOM'">
                                <div class="determinate" :style="{width: myShakeCount/200*100 + '%'}"></div>
                            </div>
                            <div class="progress red lighten-4" v-if="currentPlayer.userType === 'BRIDE'">
                                <div class="determinate red" :style="{width: myShakeCount/200*100 + '%'}"></div>
                            </div>
                            <p v-if="currentPlayer.userType === 'GROOM'" class="guest-type-text">男方宾客</p>
                            <p v-if="currentPlayer.userType === 'BRIDE'" class="guest-type-text">女方宾客</p>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <div class="container">
                        <h6>所有排名</h6>
                    </div>
                </div>
                <div class="section-content">
                    <ul class="collection no-border">
                        <li class="collection-item avatar" v-for="player in players">
                            <img :src="player.avatarImageUrl" class="circle">
                            <span class="title">{{player.userName}}
                                <span class="ranking-text grey-text"> 第<span :class="$index < 3 ? 'red-text' : ''">{{$index + 1}}</span>名</span>
                                <img v-if="player.rankingImgUrl" :src="player.rankingImgUrl" class="win-stamp">
                                <span class="badge">{{player.shakeCount}}</span></span>
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
    </div>
</template>

<script>
    var store = require('../../store');
    var Loader = wy.base.Loader;
    var RANKING_IMG_URL = ['static/images/1st_place.png','static/images/2nd_place.png','static/images/3rd_place.png'];

    module.exports = {
        data: function() {
            return {
                winStampImgUrl: 'static/images/win_stamp.jpg',
                myRanking: '',
                myRankingImgUrl: '',
                myShakeCount: 0
            };
        },

        computed: {
            currentPlayer: function() {
                return store.state.player.currentPlayer;
            },
            currentRoom: function() {
                return store.state.player.currentRoom;
            },
            players: function() {
                var ranking = store.state.player.currentRoom.ranking || [];
                var players = [];
                var that = this;

                ranking.forEach(function(r, index) {
                    var player = store.state.player.rankingPage.playerList.filter(function(p) {
                        return p.objectId === r.playerId;
                    })[0];

                    if(r.playerId === store.state.player.currentPlayer.objectId) {
                        that.myShakeCount = r.shakeCount;
                        that.myRanking = index + 1;
                        that.myRankingImgUrl = RANKING_IMG_URL[index];
                    }


                    // after generate ranking in server side, user.shakeCount will be reset as 0;
                    if(player) {
                        player.shakeCount = r.shakeCount;
                        if(index < 3) {
                            player.rankingImgUrl = RANKING_IMG_URL[index];
                        }
                        players.push(player);
                    }
                });

                return players;
                /* already sort in server side
                if(players.length === 0)
                    return players;
                else
                    return players.sort(function(p1, p2) {
                        // descend order
                        return p2.shakeCount - p1.shakeCount;
                    });*/
            },
            /*bridePlayers: function() {
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
            }*/
        },

        ready: function() {
            var loader = new Loader();
            var sliderContainer = this.$els.sliderContainer;

            loader.add('background', 'static/images/wedding_pic_10.jpg', function(r) {
                applySliderImageTilting(sliderContainer, r.data);
            });

            loader.load();

            //$(this.$els.tabs).tabs();
            var animation = wy.base.Animation.applyAnimation($(this.$els.winStamp), {
                animationName: 'zoomIn',
                delay: 1000,
                onAnimationEnd: function() {
                    animation.revoke();
                }
            });

            var roomId = this.$route.params.roomId;
            store.actions.getRoomDetails(roomId);
            store.actions.getRoomRankingPlayers(roomId);

            store.actions.listenPlayerStatusChangeSocketMessage(true);
        },

        beforeDestroy: function() {
            store.actions.listenPlayerStatusChangeSocketMessage(false);
        },

        methods: {
            reload: function() {
                window.location.reload();
            }
        }
    };
</script>