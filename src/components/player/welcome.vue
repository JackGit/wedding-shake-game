<style scoped>
    .selected {
        color: red;
    }
</style>

<template>
    <div>
        <h4>welcome, please input your name and select a role</h4>
        <input type="text" v-model="userName" @input="inputUserName"/>
        <span>{{formMessage}}</span>
        <div>
            <span @click="selectUserType('BRIDE')" :class="[userType === 'BRIDE' ? 'selected' : '']">Bride Guest</span>
            <span @click="selectUserType('GROOM')" :class="[userType === 'GROOM' ? 'selected' : '']">Groom Guest</span>
        </div>
        <button @click="joinGame()">Join Game</button>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {

        computed: {
            userId: function() {
                return store.state.player.userId;
            },
            userName: function() {
                return store.state.player.userName || localStorage.userName;
            },
            userType: function() {
                return store.state.player.userType || localStorage.userType;
            },
            formMessage: function() {
                return store.state.player.welcomeView.userNameFormMessage;
            }
        },

        methods: {
            selectUserType: store.actions.selectUserType,
            start: function() {
                var router = this.$router;

                store.actions.start({
                    userName: this.userName,
                    userType: this.userType
                }).then(function(user) {
                    router.go({name: 'lobby', params: {playerId: user.objectId}});
                });
            },
            inputUserName: function(e) {
                store.actions.inputUserName(e.target.value);
            }
        }
    };
</script>