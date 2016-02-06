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
        <p>--------------- player list ---------------</p>
        <ul>
            <li v-for="player in playerList">
                <div>{{player.userName}} - {{player.shakeCount}}</div>
                <div class="line" :style="{width: player.shakeCount + '%'}"></div>
            </li>
        </ul>
        <p>--------------- game control ---------------</p>
        <div>
            <button @click="startGame()">Start Game</button>
            <button @click="stopGame()">Stop Game</button>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');

    module.exports = {
        computed: {
            playerList: function() {
                return store.state.playerList;
            }
        },

        ready: function() {
            store.actions.initDashboard();
        },

        methods: {
            startGame: store.actions.startGame,
            stopGame: store.actions.stopGame
        }
    };
</script>