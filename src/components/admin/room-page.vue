<style scoped>
    .room-edit-button {
        margin: 20px;
    }
</style>

<template>
    <div class="container">

        <div class="row">
            <div class="card cyan lighten-2">
                <a class="waves-effect btn right white black-text room-edit-button" @click="editRoom()">edit</a>
                <div class="card-content white-text">
                    <span class="card-title">{{room.roomName}} ({{room.status}})</span>
                    <p style="margin-bottom: 10px">{{room.roomDescription}}</p>
                    <p>size: {{room.roomSize}}</p>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col s6">
                <h5>BRIDE CUSTOMERS<span class="right">{{bridePlayers.length}}/{{room.roomSize}}</span></h5>
                <div class="card">
                    <div class="card-content">
                        <ul class="collection with-header">
                            <li class="collection-header">
                                <h4>Total <span class="right">{{brideShakeTotal}}</span></h4>
                            </li>
                            <li v-for="player in bridePlayers" class="collection-item avatar">
                                <img src="http://materializecss.com/images/yuna.jpg" class="circle">
                                <span class="title">{{player.userName}}</span>
                                <p>count: {{player.shakeCount}}</p>
                                <div class="progress">
                                    <div class="determinate" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col s6">
                <h5>GROOM CUSTOMERS<span class="right">{{groomPlayers.length}}/{{room.roomSize}}</span></h5>
                <div class="card">
                    <div class="card-content">
                        <ul class="collection with-header">
                            <li class="collection-header"><h4>Total<span class="right">{{groomShakeTotal}}</span></h4></li>
                            <li v-for="player in groomPlayers" class="collection-item avatar">
                                <img src="http://materializecss.com/images/yuna.jpg" class="circle">
                                <span class="title">{{player.userName}}</span>
                                <p>count: {{player.shakeCount}}</p>
                                <div class="progress pink lighten-4">
                                    <div class="determinate pink" :style="{width: player.shakeCount/200*100 + '%'}"></div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="fixed-action-btn horizontal" style="bottom: 45px; right: 45px;">
            <a class="btn-floating btn-large red">
                <i class="large material-icons">games</i>
            </a>
            <ul>
                <li>
                    <a @click="allowToJoin()" class="btn-floating yellow darken-1 tooltipped" data-position="top" data-delay="50" data-tooltip="allow join">
                        <i class="material-icons">input</i>
                    </a>
                </li>
                <li>
                    <a @click="start()" class="btn-floating green darken-1 tooltipped" data-position="top" data-delay="50" data-tooltip="start game">
                        <i class="material-icons">play_circle_outline</i>
                    </a>
                </li>
            </ul>
        </div>

        <room-edit-dialog v-ref:room-edit-dialog :room-id="$route.params.roomId"></room-edit-dialog>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {
        components: {
            'room-edit-dialog': require('./room-edit-dialog.vue')
        },

        computed: {
            room: function() {
                return store.state.admin.roomPage.roomDetails;
            },
            brideShakeTotal: function() {
                var count = 0;
                this.bridePlayers.forEach(function(player) {
                    count += player.shakeCount;
                });
                return count;
            },
            bridePlayers: function() {
                return store.state.admin.roomPage.players.filter(function(player) {
                    return player.userType === 'BRIDE';
                });
            },
            groomShakeTotal: function() {
                var count = 0;
                this.groomPlayers.forEach(function(player) {
                    count += player.shakeCount;
                });
                return count;
            },
            groomPlayers: function() {
                return store.state.admin.roomPage.players.filter(function(player) {
                    return player.userType === 'GROOM';
                });
            }
        },

        ready: function() {
            store.actions.getAdminRoomDetails(this.$route.params.roomId);
            store.actions.getAdminRoomPlayers(this.$route.params.roomId);
            store.actions.adminListenSocketMessage(true);
        },

        methods: {
            allowToJoin: function() {
                store.actions.allowToJoinRoom(this.$route.params.roomId);
            },
            start: function() {
                store.actions.startRoom(this.$route.params.roomId);
            },
            stop: function() {
                store.actions.stopRoom(this.$route.params.roomId);
            },
            editRoom: function() {
                $(this.$refs.roomEditDialog.$el).openModal();
            }
        }
    };
</script>