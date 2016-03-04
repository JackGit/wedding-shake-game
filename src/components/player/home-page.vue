<style scoped>

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

        <div class="slider-container" v-el:slider-container>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>宾客信息</h6>
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
                            <span class="teal-text text-lighten-2" v-if="currentPlayer.userType === 'BRIDE'">男方宾客</span>
                            <span class="red-text text-lighten-2" v-if="currentPlayer.userType === 'GROOM'">女方宾客</span>
                        </div>
                        <div class="col s2">
                            <h5><a v-link="{name:'profile'}"><i class="material-icons fa fa-edit grey-text text-lighten-1"></i></a></h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>回合列表</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border transparent">
                    <li class="collection-item avatar" v-for="room in roomList">
                        <i class="material-icons circle" :style="{background: room.roomColor}">{{$index + 1}}</i>
                        <div class="row">
                            <span class="title red-text text-lighten-2">{{room.roomName}}</span>
                            <p v-if="room.status === 'INIT'">未开始，请等待主持人开始该回合</p>
                            <p v-if="room.status === 'JOINING'">准备中，宾客们正在加入
                                <br>男方加入
                                <span class="teal-text text-lighten-2" style="text-decoration:underline">{{room.bridePlayersCount}}</span>人；女方加入
                                <span class="red-text text-lighten-2"  style="text-decoration:underline">{{room.groomPlayersCount}}</span>人
                            </p>
                            <p v-if="room.status === 'PLAYING'">游戏进行中</p>
                            <p v-if="room.status === 'END'">已结束</p>
                        </div>
                        <div class="row">
                            <a v-if="room.status === 'JOINING'" @click="join(room.objectId)" class="waves-effect waves-light btn red lighten-2">我要加入</a>
                            <a v-if="room.status === 'PLAYING'" @click="visit(room.objectId)" class="waves-effect waves-light btn white red-text">进入旁观</a>
                            <a v-if="room.status === 'END'" @click="ranking(room.objectId)" class="waves-effect waves-light btn white red-text">查看排行</a>
                        </div>
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
            roomList: function() {
                return store.state.player.roomList.map(function(room) {
                    var bCount = 0, gCount = 0;

                    room.players.forEach(function(p) {
                        if(p.playerType === 'BRIDE')
                            bCount ++;
                        if(p.playerType === 'GROOM')
                            gCount ++;
                    });

                    room.bridePlayersCount = bCount;
                    room.groomPlayersCount = gCount;

                    return room;
                });
            }
        },

        ready: function() {
            var loader = new Loader();
            var sliderContainer = this.$els.sliderContainer;
            /*var imageUrl = window.location.origin.indexOf('jackyang.me') !== -1
                    ? 'http://wedding.jackyang.me/images/wedding_pic_03.jpg'
                    : 'static/images/wedding_pic_03.jpg';*/

            loader.add('background', 'static/images/wedding_pic_03.jpg', function(r) {
                applySliderImageTilting(sliderContainer, r.data);
            });

            loader.load();

            store.actions.getRoomList();
            // store.actions.clearShakeCount(); // if user accidentally refresh the page while shaking, will route to home page, and shakeCount will be cleared. which may lead ranking generated with his shake count as 0
            store.actions.listenPlayerStatusChangeSocketMessage(true);
        },

        methods: {
            join: function(roomId) {
                var router = this.$router;

                store.actions.joinRoom({
                    user: store.state.player.currentPlayer,
                    roomId: roomId
                }).then(function() {
                    router.go({name: 'ready'});
                }, function(error) {
                    var errorMessage = '';

                    if(error.indexOf('full') !== -1) {
                        errorMessage = (store.state.player.currentPlayer.userType === 'BRIDE' ? '男方' : '女方') + '人数已满';
                    } else if(error.indexOf('wrong') !== 1) {
                        errorMessage = '房间已不是“开放加入”状态';
                    } else
                        errorMessage = error;

                    alert('无法加入房间：' + errorMessage);
                    store.actions.getRoomList();    // refresh room list to show the latest players in each room
                });
            },
            visit: function(roomId) {
                this.$router.go({name: 'visit', params: {roomId: roomId}});
            },
            ranking: function(roomId) {
                this.$router.go({name: 'ranking', params: {roomId: roomId}});
            },
            quit: function() {
                if(confirm('你确定要退出？')) {
                    store.actions.signout();
                    this.$router.go({name: 'login'});
                }
            }
        },

        route: {
            canActivate: function(transition) {
                var userId = store.state.player.currentPlayer.objectId;

                store.actions.getUserDetails(userId).then(function() {
                    transition.next();
                }, function() {
                    transition.redirect({name: 'login'});
                });
            }
        }
    }
</script>