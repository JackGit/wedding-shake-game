<style scoped>

</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo center">准备</a>
                    <ul class="left">
                        <li><a @click="back()"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="slider-container" v-el:slider-container>
            <div class="card col s12 no-shadow transparent white-text" style="margin-top:0;position:relative;z-index:2">
                <div class="card-content">
                    <span class="card-title">游戏规则</span>
                    <p>主持人宣布开始游戏之后，请摇动您的手机，摇的次数多的宾客将获得奖励</p>
                </div>
            </div>
        </div>

        <!--
        <ul class="tabs" v-el:tabs>
            <li class="tab col s6"><a href="#groomTab" :class="currentPlayer.userType === 'GROOM' ? 'active' : ''">男方 ({{groomPlayers.length}}/{{room.roomSize}})</a></li>
            <li class="tab col s6"><a href="#brideTab" :class="currentPlayer.userType === 'BRIDE' ? 'active' : ''">女方 ({{bridePlayers.length}}/{{room.roomSize}})</a></li>
        </ul>
        -->

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>我</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border">
                    <li class="collection-item avatar">
                        <img :src="currentPlayer.avatarImageUrl" class="circle">
                        <span class="title">{{currentPlayer.userName}}</span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>其他已加入宾客（{{players.length - 1}}）</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border">
                    <li class="collection-item avatar" v-for="player in players" v-if="player.objectId !== currentPlayer.objectId">
                        <img :src="player.avatarImageUrl" class="circle">
                        <span class="title">{{player.userName}}</span>
                    </li>
                </ul>
                <!--
                <ul class="collection no-border" id="brideTab">
                    <li class="collection-item avatar" v-for="player in bridePlayers">
                        <img :src="player.avatarImageUrl" class="circle">
                        <span class="title">{{player.userName}}</span>
                    </li>
                </ul>
                <ul class="collection no-border transparent" id="groomTab">
                    <li class="collection-item avatar" v-for="player in groomPlayers">
                        <img :src="player.avatarImageUrl" class="circle">
                        <span class="title">{{player.userName}}</span>
                    </li>
                </ul>
                -->
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');
    var Stopwatch = require('timer-stopwatch');
    var Loader = wy.base.Loader;
    var seedId;

    module.exports = {

        computed: {
            room: function() {
                return store.state.player.currentRoom;
            },
            currentPlayer: function() {
                return store.state.player.currentPlayer;
            },
            players: function() {
                return store.state.player.playerList;
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
            },*/
            status: function() {
                return store.state.player.currentRoom.status;
            }
        },

        watch: {
            'status': function(value, oldValue) {
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
            var loader = new Loader();
            var sliderContainer = this.$els.sliderContainer;

            loader.add('background', 'static/images/wedding_pic_09.jpg', function(r) {
                applySliderImageTilting(sliderContainer, r.data);
            });

            loader.load();
            //$(this.$els.tabs).tabs();

            var roomId = store.state.player.currentRoom.objectId;

            store.actions.getRoomDetails(roomId);
            store.actions.getRoomPlayers(roomId);

            store.actions.listenPlayerJoinSocketMessage(true);
            store.actions.listenPlayerLeaveSocketMessage(true);
            store.actions.listenPlayerStatusChangeSocketMessage(true);

            var router = this.$router;

            // 为了防止手机息屏而导致关闭socket连接，从而使user leave room，而导致的状态不一致
            seedId = setInterval(function() {
                if(store.state.player.currentPlayer.status !== 'JOINED') {
                    clearInterval(seedId);
                    alert('您已离开房间');
                    router.go({name: 'home'});
                } else {
                    store.actions.getUserDetails(store.state.player.currentPlayer.objectId);
                }
            }, 5000);
        },

        beforeDestroy: function() {
            store.actions.listenPlayerJoinSocketMessage(false);
            store.actions.listenPlayerLeaveSocketMessage(false);
            store.actions.listenPlayerStatusChangeSocketMessage(false);

            clearInterval(seedId);
        },

        methods: {
            leaveRoom: function() {
                var roomId = store.state.player.currentRoom.objectId;
                var userId = store.state.player.currentPlayer.objectId;
                var router = this.$router;

                store.actions.leaveRoom(roomId, userId).then(function() {
                    router.go({name: 'home'});
                }, function() {
                    alert('离开房间失败');
                });
            },
            start: function() {
                var router = this.$router;
                var timer = new Stopwatch(3000, {refreshRateMS: 1000});
                var count = 3;

                Materialize.toast('您准备好了吗？游戏马上开始！', 1500);

                timer.onTime(function() {
                    if(count > 0)
                        Materialize.toast('倒计时：' + count, 700);
                    if(count === 0)
                        Materialize.toast('Go!', 700);
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