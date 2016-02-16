<style scoped>
    .hero {
        background-image: url(https://static.artofwhere.net/img/home-slider/girl-sewing.jpg);
        background-size: cover;
        background-position: center center;
        height: 350px;
        width: 100%;
    }
</style>

<template>
    <div>
        <div class="hero"></div>
        <div class="container">
            <h5>ROOM LIST</h5>
            <div class="row">
                <div class="col s4" v-for="room in rooms">
                    <div class="card cyan lighten-2 white-text waves-effect waves-block waves-light" @click="goToRoom(room.objectId)">
                        <div class="card-image">
                            <img src="http://sd.people.com.cn/mediafile/201007/05/F2010070514353200467.jpg"/>
                            <span class="card-title black-text">{{room.roomName}}</span>
                        </div>
                        <div class="card-content">
                            <p style="margin-bottom: 10px">{{room.roomDescription}}</p>
                            <p class="grey-text text-lighten-3">SIZE<span class="right amber-text">{{room.players.length}}/{{room.roomSize}}</span></p>
                            <p class="grey-text text-lighten-3">STATUS<span class="right amber-text">{{room.status}}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fixed-action-btn" style="bottom: 45px; right: 45px;">
                <a class="btn-floating btn-large waves-effect waves-light red" @click="createRoom()">
                    <i class="material-icons">add</i>
                </a>
            </div>

            <room-edit-dialog v-ref:room-edit-dialog :room-id="selectRoomId"></room-edit-dialog>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {
        components: {
            'room-edit-dialog': require('./room-edit-dialog.vue')
        },

        computed: {
            rooms: function() {
                return store.state.admin.homePage.roomList;
            }
        },

        ready: function() {
            store.actions.getAdminRoomList();
        },

        methods: {
            createRoom: function() {
                store.actions.getEditRoomDialogData('');
                $(this.$refs.roomEditDialog.$el).openModal();
            },
            goToRoom: function(roomId) {
                this.$router.go({name: 'room', params: {roomId: roomId}});
            }
        }
    };
</script>