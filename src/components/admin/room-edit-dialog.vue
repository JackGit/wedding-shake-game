<style>

</style>

<template>
    <div id="modal1" class="modal modal-fixed-footer">
        <div class="modal-content">
            <h4>{{!roomId ? 'Create Room' : 'Update Room'}}</h4>
            <div class="row">
                <form class="col s12">
                    <div class="input-field col s12">
                        <input type="text" class="validate" id="roomEditDialogRoomName" value="{{room.roomName}}" v-el:room-name >
                        <label for="roomEditDialogRoomName">Room Name</label>
                    </div>
                    <div class="input-field col s12">
                        <input type="text" id="roomEditDialogRoomDesc" value="{{room.roomDescription}}" v-el:room-description >
                        <label for="roomEditDialogRoomDesc">Room Description</label>
                    </div>
                    <div class="input-field col s12">
                        <input type="text" id="roomEditDialogRoomSize" value="{{room.roomSize}}" v-el:room-size >
                        <label for="roomEditDialogRoomSize">Room Size</label>
                    </div>
                </form>
            </div>
        </div>
        <div class="modal-footer">
            <a @click="submitForm()" class=" modal-action modal-close waves-effect waves-green btn-flat">Confirm</a>
            <a class=" modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {
        props: {
            roomId: {
                type: String,
                default: ''
            }
        },

        computed: {
            room: function() {
                return store.state.admin.editRoomDialog.roomDetails;
            }
        },

        ready: function() {

        },

        methods: {
            createRoom: function() {
                store.actions.createRoom({
                    roomName: this.$els.roomName.value,
                    roomDescription: this.$els.roomDescription.value,
                    roomSize: this.$els.roomSize.value
                }).then(function(room) {
                    console.log('room created', room);
                    store.actions.getAdminRoomList();
                }, function(error) {

                });
            },

            updateRoom: function() {
                store.actions.updateRoom({
                    roomId: this.roomId,
                    roomName: this.$els.roomName.value,
                    roomDescription: this.$els.roomDescription.value,
                    roomSize: this.$els.roomSize.value
                }).then(function(room) {
                    console.log('room updated', room);
                    store.actions.getAdminRoomList();
                }, function(error) {

                });
            },

            submitForm: function() {
                if(this.roomId)
                    this.updateRoom();
                else
                    this.createRoom();
            }
        }
    }
</script>