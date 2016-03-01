<style>

</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo center">{{adminUser.userName}}</a>
                    <ul class="right">
                        <li><a @click="quit()"><i class="material-icons fa fa-sign-out"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>ROOM LIST</h6>
                </div>
            </div>
            <div class="section-content">
                <ul class="collection no-border transparent">
                    <li class="collection-item avatar" v-for="room in roomList">
                        <i class="material-icons circle" :style="{background: room.roomColor}">{{$index + 1}}</i>
                        <div class="row">
                            <span class="title red-text text-lighten-2">{{room.roomName}} ({{room.status}})</span>
                            <p>{{room.roomDescription}}</p>
                        </div>
                        <div class="row">
                            <a @click="checkRoomDetails(room.objectId)" class="waves-effect waves-light btn red lighten-2">Details</a>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <div class="fixed-action-btn" style="bottom: 45px; right: 24px;">
            <a class="btn-floating btn-large red waves-effect waves-light" v-link="{name:'room-create'}">
                <i class="material-icons fa fa-plus"></i>
            </a>
        </div>
    </div>
</template>

<script>
    var store = require('../../store/admin.js');

    module.exports = {
        computed: {
            adminUser: function() {
                return store.state.admin.user;
            },
            roomList: function() {
                return store.state.admin.roomList;
            }
        },

        ready: function() {
            store.actions.getRoomList();
        },

        methods: {
            quit: function() {
                store.actions.signout();
                this.$router.go({name: 'login'});
            },
            checkRoomDetails: function(roomId) {
                this.$router.go({name: 'room', params: {roomId: roomId}});
            },
            createRoom: function() {
                this.$router.go({name: 'room-create'});
            }
        },

        route: {
            canActivate: function(transition) {
                if(!localStorage.adminUserId)
                    transition.redirect({name: 'login'});
                else {
                    store.actions.checkAdminUser(localStorage.adminUserId).then(function() {
                        transition.next();
                    }, function() {
                        transition.redirect({name: 'login'});
                    });
                }
            }
        }
    };
</script>