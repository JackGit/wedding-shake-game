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
        <h4>admin page</h4>
        <p>room list</p>
        <ul>
            <li v-for="room in rooms">
                {{room.roomName}}
            </li>
        </ul>
        <button @click="createRoom()">Create Room</button>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {
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
                var router = this.$router;

                store.actions.createRoom({
                    roomName: 'test room name',
                    roomDescription: 'test room description',
                    roomSize: 5
                }).then(function(room) {
                    console.log('room created', room);
                    router.go({name: 'room', params: {roomId: room.objectId}});
                }, function(error) {

                });
            }
        }
    };
</script>