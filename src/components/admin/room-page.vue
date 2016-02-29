<style>

</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo center">Room Details</a>
                    <ul class="left">
                        <li><a v-link="{name:'home'}"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                    <ul class="right">
                        <li><a @click="{name:'room-edit',params:{roomId:$route.roomId}}"><i class="material-icons fa fa-pencil"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <ul class="tabs" v-el:tabs>
            <li class="tab col s6"><a href="#roomInfo" class="active">Room Info</a></li>
            <li class="tab col s6"><a href="#playerList">Players</a></li>
        </ul>

        <div class="section" id="roomInfo">
            <div class="section-header">
                <div class="container">
                    <h6>ROOM STATUS</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card no-shadow">
                    <div class="card-content" style="margin-bottom:0">
                        <h1 class="center-align">{{room.status}}</h1>
                    </div>
                </div>
            </div>
            <div class="section-header">
                <div class="container">
                    <h6>BASE INFO</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card no-shadow">
                    <div class="card-content" style="margin-bottom:0">
                        <div class="row">
                            <div class="col s12">
                                <h6>Name</h6>
                                <span>{{room.roomName}}</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col s12">
                                <h6>Description</h6>
                                <span>{{room.roomDescription}}</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col s12">
                                <h6>Size</h6>
                                <span>{{room.roomSize}}</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col s12">
                                <h6>Color</h6>
                                <span>...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="section" id="playerList">
            <div class="section-header">
                <div class="container">
                    <h6>PLAYERS</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border">
                    <li class="collection-item avatar" v-for="player in players">
                        <img :src="player.avatarImageUrl" class="circle">
                        <span class="title">{{player.userName}}</span>
                        <p>{{player.userType}}</p>
                    </li>
                </ul>
            </div>
        </div>

        <div class="fixed-action-btn horizontal click-to-toggle" style="bottom: 45px; right: 24px;">
            <a class="btn-floating btn-large red">
                <i class="large mdi-navigation-menu"></i>
            </a>
            <ul>
                <li><a class="btn-floating red darken-1"><i class="material-icons fa fa-users"></i></a></li>
                <li><a class="btn-floating green darken-1"><i class="material-icons fa fa-play"></i></a></li>
                <li><a class="btn-floating yellow darken-1"><i class="material-icons fa fa-stop"></i></a></li>
                <li><a class="btn-floating grey darken-1"><i class="material-icons fa fa-refresh"></i></a></li>
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
            }
        },

        ready: function() {
            $(this.$els.tabs).tabs();
            store.actions.getRoomDetails(this.$route.params.roomId);
            store.actions.getRoomPlayers(this.$route.params.roomId);
        }
    };
</script>