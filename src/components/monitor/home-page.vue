<style>
    .dashboard-item h1{
        margin: 0;
    }

    .avatar {
        border-radius: 50%;
    }
</style>

<template>
    <div class="">
        <div class="row dashboard-item">
            <label>参加人数</label>
            <h1 class="teal-text">121</h1>
        </div>
        <div class="row dashboard-item">
            <label>倒计时</label>
            <h1 class="red-text">00:14.1</h1>
        </div>
        <div class="row">
            <label>前三名</label>
            <div class="card" v-for="player in winners">
                <div class="card-content row">
                    <img class="col s4 avatar" :src="player.avatarImageUrl">
                    <div class="col s8">
                        <span class="grey-text">{{player.userName}}</span>
                        <h5>{{player.shakeCount}}</h5>
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
    var CenterIt = wy.base.CenterIt;

    module.exports = {

        ready: function() {
            var loader = new Loader();

            loader.add('background', 'static/images/monitor_background_01.jpg', function(r) {
                var $container = $('body');
                var img = r.data;
                var center = new CenterIt($container.width(), $container.height(), img.naturalWidth, img.naturalHeight, {type: 'cover'});
                var $img = $(img).css('position', 'absolute');

                $img.width(center.newWidth());
                $img.height(center.newHeight());
                $img.css('top', center.offset().top + 'px');
                $img.css('left', center.offset().left + 'px');

                // $container.append($img);

                PageAPI.hideMask(); // global method
            });

            loader.load();

            PageAPI.init();

            store.actions.on('status-change');
        },

        computed: {
            room: function() {
                return store.state.room;
            },
            roomStatusDesc: function() {
                var str = '';
                switch(store.state.room.status) {
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
            },
            winners: function() {
                return store.state.rankingPlayerList.sort(function(p1, p2) {
                    return p2.shakeCount - p1.shakeCount;
                }).slice(0, 3);
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