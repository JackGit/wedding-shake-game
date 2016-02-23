<style scoped>
    .avatar-container {
        padding: 50px 0 30px 0;
    }

    .avatar {
        border-radius: 50%;
        width: 60px;
        height: 60px;
    }
</style>

<template>
    <div class="container">
        <div class="row">
            <div class="col s12 avatar-container">
                <div class="col s12 center-align">
                    <img :src="player.avatarImageUrl" class="avatar"/>
                </div>
                <h6 class="center-align">{{player.userName}}</h6>
            </div>
        </div>
        <div class="row">
            <div class="card">
                <div class="card-content">
                    <div class="row">
                        <div class="input-field col s12">
                            <select v-el:user-type>
                                <option value="" disabled selected>Choose your option</option>
                                <option value="BRIDE">Bride Guest</option>
                                <option value="GROOM">Groom Guest</option>
                            </select>
                            <label>Please select your guest type</label>
                        </div>
                    </div>
                </div>
                <div class="card-action row">
                    <a class="col s12 waves-effect waves-light btn btn-large red white-text" @click="start()">Start</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    /**
     * welcome page
     *  1. 1st time to open this page, need to input user name and user type, then click start
     *  2. not 1st time to open this page, with user information, just route to home page
     */

    var store = require('../../store');

    module.exports = {

        computed: {
            player: function() {
                return store.state.player.currentPlayer;
            }
        },

        ready: function() {
            $('select').material_select();
        },

        methods: {
            start: function() {
                var router = this.$router;

                store.actions.registerPlayer({
                    objectId: store.state.player.currentPlayer.objectId,
                    userType: this.$els.userType.value
                }).then(function() {
                    router.go({name: 'home'});
                });
            }
        },

        route: {
            data: function(transition) {
                var userId = store.state.player.currentPlayer.objectId;
                var userType = store.state.player.currentPlayer.userType;

                if(userId) {
                    if(userType) {
                        transition.redirect({name: 'home'});
                    } else {
                        transition.next();
                    }
                } else {
                    window.location.href = window.location.origin + '/qq_login.html';
                }
            }
        }
    };
</script>