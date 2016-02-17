<style scoped>
    .shake-page-unit {
        font-size: 20px;
    }
</style>

<template>
    <div>
        <nav>
            <div class="nav-wrapper red lighten-2">
                <a href="#" class="brand-logo">Shaking</a>
                <ul id="nav-mobile" class="left">
                    <li><a><i class="material-icons">open_in_new</i></a></li>
                </ul>
            </div>
        </nav>

        <div class="container">
            <div class="row">
                <h6 class="grey-text" v-if="showResult">YOUR RESULT</h6>
                <div class="card" v-if="showResult">
                    <div class="card-content">
                        <h4 class="card-title center-align">GAME END~</h4>
                        <p>Congratulations! You just shaked <span class="teal-text" style="font-size: 1.5em">{{shakeCount}}</span> times in last <span class="red-text" style="font-size: 1.5em">{{time / 1000}}</span> seconds!</p>
                    </div>
                    <div class="card-content red lighten-3 white-text">
                        a chart here
                    </div>
                    <div class="card-action">
                        <a class="waves-effect waves-teal btn-flat">Check RANKING</a>
                    </div>
                </div>

                <h6 class="grey-text" v-if="!showResult">SHAKE COUNT</h6>
                <div class="card" v-if="!showResult">
                    <div class="card-content">
                        <h1 class="center-align teal-text">{{shakeCount}}<span class="shake-page-unit">times</span></h1>
                    </div>
                </div>

                <h6 class="grey-text" v-if="!showResult">TIME</h6>
                <div class="card" v-if="!showResult">
                    <div class="card-content">
                        <h4 class="center-align red-text">{{stopwatchString}}<i class="material-icons shake-page-unit">restore</i></h4>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    var Stopwatch = require('timer-stopwatch');
    // threshold = 15, timeout = 100 => 80 times / 10s, for both iphone and android
    var ShakeJS = require('shake.js');
    var shake = null;

    module.exports = {
        data: function() {
            return {
                time: 20 * 1000,
                stopwatchString: '00:00.0',
                showResult: false
            }
        },

        computed: {
            shakeCount: function() {
                return store.state.player.currentPlayer.shakeCount;
            }
        },

        ready: function() {
            var unit = 100;
            var that = this;
            var timer = new Stopwatch(this.$data.time, {refreshRateMS: unit});
            var total = this.$data.time;

            timer.onTime(function() {
                if(total > 0) {
                    var s = '00' + Math.floor(total / 1000);
                    var sStr = s.substring(s.length - 2, s.length);
                    var ss = total % 1000 / unit;
                    that.$data.stopwatchString = '00:' + sStr + '.' + ss;
                }
                total -= unit;
            });
            timer.onDone(function() {
                shake.stop();
                that.$data.stopwatchString = '00:00.0';
                that.showResult = true;
            });

            timer.start();

            if(shake) {
                shake.stop();
            } else {
                window.addEventListener('shake', function() {
                    store.actions.shake();
                }, false);

                shake = new ShakeJS({
                    threshold: 15,
                    timeout: 100
                });
            }
            shake.start();
        }
    };
</script>