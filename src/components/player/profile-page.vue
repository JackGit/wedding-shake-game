<style scoped>
    .avatar-container {
        padding: 50px 0 30px 0;
    }

    .avatar {
        border-radius: 50%;
        width: 80px;
        height: 80px;
        background-color: white;
    }
</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo">个人信息</a>
                    <ul class="left">
                        <li><a @click="back()"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="slider-container" v-el:slider-container>
            <div class="row" style="position:relative;z-index:2">
                <div class="col s12 avatar-container">
                    <div class="col s12 center-align">
                        <img :src="player.avatarImageUrl" class="avatar"/>
                    </div>
                    <h5 class="center-align white-text">{{player.userName}}</h5>
                    <h6 class="center-align grey-text text-lighten-4" v-if="player.userType === 'GROOM'">男方宾客</h6>
                    <h6 class="center-align grey-text text-lighten-4" v-if="player.userType === 'BRIDE'">女方宾客</h6>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>修改个人信息</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card no-shadow">
                    <div class="card-content">
                        <div class="row">
                            <div class="col s12">
                                <div class="row">
                                    <div class="input-field col s12">
                                        <input id="profile-page-user-name-input" type="text" value="{{player.userName}}" v-el:user-name>
                                        <label for="profile-page-user-name-input" class="active">您的名称或者昵称</label>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="input-field col s12">
                                        <select v-el:user-type>
                                            <option value="" disabled :selected="!player.userType">请选择您的宾客类别</option>
                                            <option value="GROOM" :selected="player.userType === 'GROOM'">男方宾客</option>
                                            <option value="BRIDE" :selected="player.userType === 'BRIDE'">女方宾客</option>
                                        </select>
                                        <label>宾客类别</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="row">
                <a class="col s12 waves-effect waves-light btn btn-large red white-text" @click="submitEdit()">提交修改</a>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');
    var Vue = require('vue');
    var Loader = wy.base.Loader;

    module.exports = {
        computed: {
            player: function() {
                return store.state.player.currentPlayer;
            }
        },

        ready: function() {
            var loader = new Loader();
            var sliderContainer = this.$els.sliderContainer;

            loader.add('background', 'static/images/wedding_pic_06.jpg', function(r) {
                applySliderImageTilting(sliderContainer, r.data);
            });

            loader.load();
            $('select').material_select();
            store.actions.getUserDetails(store.state.player.currentPlayer.objectId);
        },

        methods: {
            submitEdit: function() {
                var router = this.$router;
                var user = {
                    objectId: store.state.player.currentPlayer.objectId,
                    userName: this.$els.userName.value,
                    userType: this.$els.userType.value
                };
                store.actions.updateUserDetails(user).then(function() {
                    Materialize.toast('更新成功', 1000);
                    router.go({name: 'home'});
                }, function() {
                    Materialize.toast('更新失败', 1000);
                });
            },
            back: function() {
                this.$router.go({name: 'home'});
            }
        }
    };
</script>