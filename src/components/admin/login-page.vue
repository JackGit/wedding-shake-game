<style>

</style>

<template>
    <div>
        <div class="container">
            <div class="row">
                <div class="input-field col s12">
                    <input v-el:user-name placeholder="user name" id="loginPageUserName" type="text">
                </div>
                <div class="input-field col s12">
                    <input v-el:password placeholder="password" id="loginPagePassword" type="password">
                </div>
            </div>
            <div class="row">
                <a class="col s12 waves-effect waves-light btn btn-large red white-text" @click="login()">Login</a>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store/admin.js');

    module.exports = {
        methods: {
            login: function() {
                var router = this.$router;

                store.actions.login({
                    userName: this.$els.userName.value,
                    password: this.$els.password.value
                }).then(function() {
                    router.go({name: 'home'});
                }).catch(function(error) {
                    console.log('error', error);
                    alert('login error: ' +  error.message);
                });
            }
        }
    };
</script>