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
                        <i v-if="$index == 0" class="material-icons circle" style="background: #90dde3">{{$index + 1}}</i>
                        <i v-if="$index == 1" class="material-icons circle" style="background: #f79a3d">{{$index + 1}}</i>
                        <i v-if="$index == 2" class="material-icons circle" style="background: #f56937">{{$index + 1}}</i>
                        <div class="row">
                            <span class="title red-text text-lighten-2">{{room.roomName}}</span>
                            <p v-if="room.status === 'INIT'">Game is not started yet, please wait.</p>
                            <p v-if="room.status === 'JOINING'">People are joining, there are {{room.players.length}} players joined the game.</p>
                            <p v-if="room.status === 'PLAYING'">Game is playing right now. You can't join right now.</p>
                            <p v-if="room.status === 'END'">Game is ended.</p>
                        </div>
                        <div class="row">
                            <a @click="checkRoomDetails(room.objectId)" class="waves-effect waves-light btn red lighten-2">Details</a>
                        </div>
                    </li>
                </ul>
            </div>
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
        }
    };
</script>