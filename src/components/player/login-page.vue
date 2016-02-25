<style>

</style>

<template>
    <div>
        <div class="container">
            <div class="row">
                <div class="card">
                    <div class="card-content">
                        <span class="card-title">welcome, please login</span>
                        <div class="row">
                            <div class="col s12">
                                <ul class="tabs" v-el:tabs>
                                    <li class="tab col s6"><a href="#normalLoginTab" >login</a></li>
                                    <li class="tab col s6"><a href="#qqLoginTab" class="active">QQ</a></li>
                                </ul>
                            </div>
                            <div id="normalLoginTab" class="col s12">
                                <div class="row">
                                    <div class="input-field col s12">
                                        <input v-el:user-name placeholder="user name" id="loginPageUserName" type="text">
                                        <label for="loginPageUserName" class="active">User Name</label>
                                    </div>
                                    <div class="input-field col s12">
                                        <select v-el:user-type>
                                            <option value="" disabled selected>Choose your option</option>
                                            <option value="BRIDE">Bride Guest</option>
                                            <option value="GROOM">Groom Guest</option>
                                        </select>
                                        <label>Please select your guest type</label>
                                    </div>
                                </div>
                                <div class="card-action row">
                                    <a class="col s12 waves-effect waves-light btn btn-large red white-text" @click="start()">Start</a>
                                </div>
                            </div>
                            <div id="qqLoginTab" class="col s12">
                                <div class="row center-align">
                                    <div class="row"></div>
                                    <a :href="qqLoginUrl">
                                        <img :src="qqLoginImage">
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {
        data: function() {
            return {
                qqLoginUrl: 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101295012&redirect_uri=http%3A%2F%2Fwedding.jackyang.me%2Fqq_login_callback.html&state=test&scope=all',
                qqLoginImage: 'static/images/Connect_logo_4.png'
            }
        },

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
                    transition.redirect({name: 'qqLogin'});
                else
                    transition.next();
            }
        }
    };
</script>