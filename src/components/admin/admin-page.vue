<style scoped>
    .line {
        background: red;
        display: inline-block;
        height: 2px;
        width: 0%;
        transition: width 0.5s ease;
    }
</style>

<template>
    <div>
        <h4>admin page 中文<i class="material-icons">grade</i></h4>
        <p>room list</p>
        <ul>
            <li v-for="room in rooms" @click="goToRoom(room.objectId)">
                {{room.roomName}}
            </li>
        </ul>
        <button @click="createRoom()">Create Room</button>
        <room-edit-dialog v-ref:room-edit-dialog :room-id="selectRoomId"></room-edit-dialog>
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