<style>
    #monitorBackgroundImage {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        z-index: -1;
    }
    .blur {
        -webkit-filter: blur(10px); /* Chrome, Opera */
        -moz-filter: blur(10px);
        -ms-filter: blur(10px);
        filter: blur(10px);
    }
    .board {
        min-height: 450px;
    }
    .border-header {
        height: 160px;

    }
    .total-count {
        position: absolute;
        top: 160px;
        font-size: 300px;
        line-height: 300px;
    }
    .total-count.right {
        right: 0;
    }
    .total-count.left {
        left: 0;
    }
    .progress-bg {
        background-color: rgba(0, 0, 0, 0.2) !important;
    }

    .leftIn-transition, .rightIn-transition {
        transition: all 0.4s ease;
    }
    .leftIn-enter {
        opacity: 0;
        transform: translateY(-20%);
    }
    .leftIn-leave {
        opacity: 0;
        transform: translateY(20%);
    }
    .rightIn-enter {
        opacity: 0;
        transform: translateY(20%);
    }
    .rightIn-leave {
        opacity: 0;
        transform: translateY(-20%);
    }
 </style>

<template>
    <div>
        <div id="monitorBackgroundImage" :class="show ? 'blur' : ''"></div>

        <div v-if="show" transition="fade" class="z-depth-1 row" style="padding:20px;background:white">
            <h4 class="center-align">{{room.roomName}}</h4>
        </div>

        <div class="container">
            <div class="row">
                <div class="col s12" v-if="false" transition="fade" >
                    <h3 class="center-align red-text"><span class="black-text" style="font-size:18px">倒计时: </span>00:19.80</h3>
                </div>

                <div class="col s6" v-if="show" transition="leftIn" >
                    <div class="card board">
                        <div class="total-count right red-text text-lighten-4">{{groomTotal}}</div>
                        <div class="card-content border-header">
                            <div class="row">
                                <div class="col s6 offset-s6">
                                    <h5 class="red-text text-lighten-2">新娘队</h5>
                                    <h6 class="grey-text text-lighten-1">{{groomPlayers.length}}宾客参与</h6>
                                </div>
                            </div>
                        </div>
                        <div class="card-content">
                            <ul class="collection">
                                <li class="collection-item avatar transparent" v-for="player in groomPlayers">
                                    <img :src="player.avatarImageUrl" alt="" class="circle">
                                    <span class="title">{{player.userName}}<span class="badge">{{player.shakeCount}}</span></span>
                                    <div class="progress progress-bg">
                                        <div class="determinate red" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="col s6" v-if="show" transition="rightIn" >
                    <div class="card board">
                        <div class="total-count left teal-text text-lighten-4">{{brideTotal}}</div>
                        <div class="card-content border-header">
                            <div class="row">
                                <div class="col s6">
                                    <h5 class="teal-text text-lighten-2">新郎队</h5>
                                    <h6 class="grey-text text-lighten-1">{{bridePlayers.length}}宾客参与</h6>
                                </div>
                            </div>
                        </div>
                        <div class="card-content">
                            <ul class="collection">
                                <li class="collection-item avatar transparent" v-for="player in bridePlayers">
                                    <img :src="player.avatarImageUrl" alt="" class="circle">
                                    <span class="title">{{player.userName}}<span class="badge">{{player.shakeCount}}</span></span>
                                    <div class="progress progress-bg">
                                        <div class="determinate" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store/monitor.js');
    var Stopwatch = require('timer-stopwatch');
    var Loader = wy.base.Loader;
    var Tilting = wy.base.Tilting;
    var CenterIt = wy.base.CenterIt;

    module.exports = {

        ready: function() {
            var loader = new Loader();

            loader.add('background', 'static/images/monitor_background_01.jpg', function(r) {
                var $container = $('#monitorBackgroundImage');
                var img = r.data;
                var center = new CenterIt($container.width(), $container.height(), img.naturalWidth, img.naturalHeight, {type: 'cover'});
                var $img = $(img).css('position', 'absolute');

                $img.width(center.newWidth());
                $img.height(center.newHeight());
                $img.css('top', center.offset().top + 'px');
                $img.css('left', center.offset().left + 'px');

                $container.append($img);
                new Tilting($img, {limitY: 0});
            });

            loader.load();

            store.actions.getRoomDetails();
            store.actions.getRoomPlayers();
            store.actions.on('join');
            store.actions.on('leave');
            store.actions.on('shake');
            store.actions.on('status-change');
        },

        computed: {
            room: function() {
                return store.state.room;
            },
            players: function() {
                return store.state.playerList;
            },
            groomPlayers: function() {
                return store.state.playerList.filter(function(p) {
                    return p.userType === 'GROOM';
                });
            },
            bridePlayers: function() {
                return store.state.playerList.filter(function(p) {
                    return p.userType === 'BRIDE';
                });
            },
            brideTotal: function() {
                var total = 0;
                (store.state.playerList || []).forEach(function(r) {
                    if(r.userType === 'BRIDE')
                        total += r.shakeCount;
                });
                return total;
            },
            groomTotal: function() {
                var total = 0;
                (store.state.playerList || []).forEach(function(r) {
                    if(r.userType === 'GROOM')
                        total += r.shakeCount;
                });
                return total;
            },
            show: function() {
                return store.state.show;
            }
        },

        beforeDestroy: function() {
            store.actions.off('join');
            store.actions.off('leave');
            store.actions.off('shake');
            store.actions.off('status-change');
        }
    };
</script>