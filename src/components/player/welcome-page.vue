<style scoped>

</style>

<template>
    <div class="container">
        <div class="row">
            <div class="card">
                <div class="card-content">
                    <span class="card-title">welcome</span>
                    <div class="row">
                        <div class="input-field col s12">
                            <input type="text" id="welcome_user_name_input" placeholder="user name" v-el:user-name/>
                            <label class="" for="welcome_user_name_input">User Name</label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s12">
                            <select v-el:user-type>
                                <option value="" disabled selected>Choose your option</option>
                                <option value="BRIDE">Bride Guest</option>
                                <option value="GROOM">Groom Guest</option>
                            </select>
                            <label>Guest Type {{selected}}</label>
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

        ready: function() {
            $('select').material_select();
        },

        methods: {
            start: function() {
                var router = this.$router;

                store.actions.registerPlayer({
                    userName: this.$els.userName.value,
                    userType: this.$els.userType.value
                }).then(function(user) {
                    router.go({name: 'home', params: {userId: user.objectId}});
                });
            }
        },

        route: {
            data: function(transition) {
                var userId = store.state.player.currentPlayer.userId;

                if(userId)
                    transition.redirect({name: 'home', params: {userId: userId}});
                else
                    transition.next();
            }
        }
    };
</script>