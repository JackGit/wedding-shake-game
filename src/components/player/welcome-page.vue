<style scoped>
    .selected {
        color: red;
    }
</style>

<template>
    <div>
        <h4>welcome, please input your name and select a role</h4>
        <p>name:</p>
        <input type="text" v-model="userName" @input="inputUserName"/>

        <p>type:</p>
        <div>
            <span @click="inputUserType('BRIDE')" :class="[userType === 'BRIDE' ? 'selected' : '']">Bride Guest</span>
            <span @click="inputUserType('GROOM')" :class="[userType === 'GROOM' ? 'selected' : '']">Groom Guest</span>
        </div>
        <button @click="start()">Start</button>
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
            userName: function() {
                return store.state.player.welcomePage.formUserName;
            },
            userType: function() {
                return store.state.player.welcomePage.formUserType;
            },
            userNameMessage: function() {
                return store.state.player.welcomePage.formUserNameMessage;
            },
            userTypeMessage: function() {
                return store.state.player.welcomePage.formUserTypeMessage;
            }
        },

        methods: {
            start: function() {
                var router = this.$router;

                store.actions.registerPlayer({
                    userName: this.userName,
                    userType: this.userType
                }).then(function(user) {
                    router.go({name: 'home', params: {userId: user.objectId}});
                });
            },
            inputUserName: function(e) {
                store.actions.inputUserName(e.target.value);
            },
            inputUserType: function(userType) {
                store.actions.inputUserType(userType);
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