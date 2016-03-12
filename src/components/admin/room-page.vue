<style>

</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo center">房间详细</a>
                    <ul class="left">
                        <li><a v-link="{name:'home'}"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                    <ul class="right">
                        <li><a v-link="{name:'room-edit',params:{roomId:$route.params.roomId}}"><i class="material-icons fa fa-pencil"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <ul class="tabs" v-el:tabs>
            <li class="tab col s6"><a href="#roomInfo" class="active">房间信息</a></li>
            <li class="tab col s6"><a href="#playerList" @click="getRoomPlayers">参与玩家信息</a></li>
        </ul>

        <div class="section" id="roomInfo">
            <div class="section-header">
                <div class="container">
                    <h6>房间状态</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card no-shadow">
                    <div class="card-content" style="margin-bottom:0">
                        <h1 class="center-align">{{roomStatusDesc}}</h1>
                    </div>
                </div>
            </div>
            <div class="section-header">
                <div class="container">
                    <h6>基本信息</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card no-shadow">
                    <div class="card-content" style="margin-bottom:0">
                        <div class="row">
                            <div class="col s12">
                                <h6>房间名</h6>
                                <span>{{room.roomName}}</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col s12">
                                <h6>房间描述</h6>
                                <span>{{room.roomDescription}}</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col s12">
                                <h6>房间大小</h6>
                                <span>{{room.roomSize}}</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col s12">
                                <h6>房间颜色</h6>
                                <span>{{room.roomColor}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="section" id="playerList">
            <div class="section-header">
                <div class="container">
                    <h6>参与玩家</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border">
                    <li class="collection-item avatar" v-for="player in players">
                        <img :src="player.avatarImageUrl" class="circle">
                        <span class="title">{{player.userName}}</span>
                        <p v-if="player.userType === 'BRIDE'">男方宾客</p>
                        <p v-if="player.userType === 'GROOM'">女方宾客</p>
                    </li>
                </ul>
            </div>
        </div>

        <div class="fixed-action-btn horizontal click-to-toggle" style="bottom: 45px; right: 24px;">
            <a class="btn-floating btn-large red waves-effect waves-light">
                <i class="large mdi-navigation-menu"></i>
            </a>
            <ul>
                <li><a class="btn-floating red darken-1" @click="allowJoin"><i class="material-icons fa fa-users"></i></a></li>
                <li><a class="btn-floating green darken-1" @click="startGame"><i class="material-icons fa fa-play"></i></a></li>
                <li><a class="btn-floating yellow darken-1" @click="endGame"><i class="material-icons fa fa-stop"></i></a></li>
            </ul>
        </div>

    </div>
</template>

<script>
    var store = require('../../store/admin.js');

    module.exports = {
        computed: {
            room: function() {
                return store.state.admin.currentRoom;
            },
            players: function() {
                return store.state.admin.playerList;
            },
            roomStatusDesc: function() {
                var str = '';
                switch(store.state.admin.currentRoom.status) {
                    case 'INIT':
                        str = '未开始';
                        break;
                    case 'JOINING':
                        str = '开放加入中';
                        break;
                    case 'PLAYING':
                        str = '游戏进行中';
                        break;
                    case 'END':
                        str = '已结束';
                        break;
                    default:
                        break;
                }
                return str;
            }
        },

        ready: function() {
            $(this.$els.tabs).tabs();
            store.actions.getRoomDetails(this.$route.params.roomId);
            store.actions.getRoomPlayers(this.$route.params.roomId);
        },

        methods: {
            allowJoin: function() {
                if(this.room.status === 'INIT' || this.room.status === 'END')
                    store.actions.allowToJoinRoom(this.$route.params.roomId);
                else
                    Materialize.toast('当前状态下不能“开发加入”', 1000);
            },
            startGame: function() {
                if(this.room.status === 'JOINING')
                    store.actions.startRoom(this.$route.params.roomId);
                else
                    Materialize.toast('当前状态下不能“开始”', 1000);
            },
            endGame: function() {
                store.actions.stopRoom(this.$route.params.roomId);
            },
            getRoomPlayers: function() {
                store.actions.getRoomPlayers(this.$route.params.roomId);
            }
        },

        route: {
            canActivate: function(transition) {
                //var adminUserId = localStorage.adminUserId;
                var adminUserId = persist.get('adminUserId');

                if(!adminUserId)
                    transition.redirect({name: 'login'});
                else {
                    store.actions.checkAdminUser(adminUserId).then(function() {
                        transition.next();
                    }, function() {
                        transition.redirect({name: 'login'});
                    });
                }
            }
        }
    };
</script>