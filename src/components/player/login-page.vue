<style>
    .background-container {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -1;
        background-image: url(http://wedding.jackyang.me/images/wedding_pic_08.jpg);
        background-repeat: no-repeat;
        -webkit-background-size: cover;
        background-size: cover;
        background-position: center center;
    }
    .login-page-header {
        height: 240px;
    }
    ::-webkit-input-placeholder {
        color: black;
    }
</style>

<template>
    <div>
        <div class="background-container"></div>

        <div class="valign-wrapper row login-page-header">
            <div class="valign col s12">
                <h5 class=" center-align" style="color: white;font-family: monospace">WELCOME TO OUR</h5>
                <h2 class=" center-align" style="color: white;font-family: serif">Wedding</h2>
            </div>
        </div>
        <div>
            <div class="container">
                <div class="row">
                    <div class="input-field col s12">
                        <input v-el:user-name placeholder="user name" id="loginPageUserName" type="text">
                    </div>
                    <div class="input-field col s12">
                        <select v-el:user-type>
                            <option value="" disabled selected>Choose your guest type</option>
                            <option value="BRIDE">Bride Guest</option>
                            <option value="GROOM">Groom Guest</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <a class="col s12 waves-effect waves-light btn btn-large red white-text" @click="start()">Start</a>
                </div>
                <div class="row">
                    <a href="https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101295012&redirect_uri=http%3A%2F%2Fwedding.jackyang.me%2Fqq_login_callback.html&state=test&scope=all" class="col s12 right-align">
                        <img src="http://wedding.jackyang.me/images/Connect_logo_4.png">
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {

        ready: function() {
            $('select').material_select();
            $(this.$els.tabs).tabs();
        },

        methods: {
            start: function() {
                var router = this.$router;
                var user = {
                    userName: this.$els.userName.value,
                    userType: this.$els.userType.value
                };

                store.actions.createUser(user).then(function() {
                    router.go({name: 'home'});
                });
            }
        },

        route: {
            canActivate: function(transition) {
                var userId = store.state.player.currentPlayer.objectId;
                var userType = store.state.player.currentPlayer.userType;

                if(userId && userType)
                    transition.redirect({name: 'home'});
                else if(userId)
                    transition.redirect({name: 'profile'});
                else
                    transition.next();
            }
        }
    };
</script>