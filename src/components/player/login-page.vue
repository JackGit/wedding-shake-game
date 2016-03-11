<style>
    .background-container {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -1;
    }
    .login-page-header {
        height: 240px;
    }
    ::-webkit-input-placeholder {
        color: grey;
    }
</style>

<template>
    <div>
        <div class="background-container" v-el:background-container></div>

        <div class="valign-wrapper row login-page-header">
            <div class="valign col s12">
                <h5 class=" center-align" style="color: white;font-family: monospace">WELCOME TO OUR</h5>
                <h2 class=" center-align" style="color: white;font-family: serif">Wedding</h2>
            </div>
        </div>
        <div style="position:absolute;width:100%;bottom:10%">
            <div class="container">
                <!--<div class="row">
                    <div class="input-field col s12">
                        <input v-el:user-name placeholder="请输入您的名称或者昵称" id="loginPageUserName" type="text">
                    </div>
                    <div class="input-field col s12">
                        <select v-el:user-type>
                            <option value="" disabled selected class="grey-text">请选择您的宾客类别</option>
                            <option value="BRIDE">男方宾客</option>
                            <option value="GROOM">女方宾客</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <a class="col s12 waves-effect waves-light btn btn-large red white-text" @click="start()">进入互动</a>
                </div> -->
                <div class="row">
                    <a href="https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101295012&redirect_uri=http%3A%2F%2Fwedding.jackyang.me%2Fqq_login_callback.html&state=test&scope=all" class="col s12 center-align">
                        <img :src="qqLogoImgUrl">
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');
    var Loader = wy.base.Loader;
    var CenterIt = wy.base.CenterIt;
    var Animation = wy.base.Animation;

    module.exports = {

        data: function() {
            return {
                qqLogoImgUrl: 'static/images/Connect_logo_5.png'
            };
        },

        ready: function() {
            $('select').material_select();
            $(this.$els.tabs).tabs();

            var loader = new Loader();
            var container = this.$els.backgroundContainer;
            /*var imageUrl = window.location.origin.indexOf('jackyang.me') !== -1
                    ? 'http://wedding.jackyang.me/images/wedding_pic_08.jpg'
                    : 'static/images/wedding_pic_08.jpg';*/

            loader.add('background', 'static/images/wedding_pic_08.jpg', function(r) {
                var img = r.data;
                var $container = $(container);
                var centerIt = new CenterIt($container.width(), $container.height(), img.naturalWidth, img.naturalHeight, {type: 'cover'});
                var $img = $(img)
                        .css('position', 'absolute')
                        .css('top', centerIt.offset().top + 'px')
                        .css('left', centerIt.offset().left + 'px')
                        .width(centerIt.newWidth())
                        .height(centerIt.newHeight());

                $container.append($img);
                Animation.applyAnimation($img, {
                    animationName: 'fadeIn',
                    duration: 500
                });
            });

            loader.load();
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