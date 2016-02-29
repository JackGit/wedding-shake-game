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
    .profile-page-image {
        width: 100%;
        height: 100%;
        background-color: #E57373;
        background-image: url(http://wedding.jackyang.me/images/wedding_pic_06.jpg);
        background-repeat: no-repeat;
        -webkit-background-size: cover;
        background-size: cover;
        background-position: center center;
    }
</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo">Profile</a>
                    <ul class="left">
                        <li><a @click="back()"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="slider-container">
            <div class="profile-page-image">
                <div class="row">
                    <div class="col s12 avatar-container">
                        <div class="col s12 center-align">
                            <img :src="player.avatarImageUrl" class="avatar"/>
                        </div>
                        <h5 class="center-align white-text">{{player.userName}}</h5>
                        <h6 class="center-align grey-text text-lighten-4">{{player.userType}} GUEST</h6>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>EDIT PROFILE</h6>
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
                                        <label for="profile-page-user-name-input" class="active">User Name</label>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="input-field col s12">
                                        <select v-el:user-type>
                                            <option value="" disabled :selected="!player.userType">Choose your option</option>
                                            <option value="BRIDE" :selected="player.userType === 'BRIDE'">Bride Guest</option>
                                            <option value="GROOM" :selected="player.userType === 'GROOM'">Groom Guest</option>
                                        </select>
                                        <label>User Type</label>
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
                <a class="col s12 waves-effect waves-light btn btn-large red white-text" @click="submitEdit()">OK</a>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');
    var Vue = require('vue');

    module.exports = {
        computed: {
            player: function() {
                return store.state.player.currentPlayer;
            }
        },

        ready: function() {
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
                    Materialize.toast('update successfully', 1000);
                    router.go({name: 'home'});
                }, function() {
                    Materialize.toast('update failed', 1000);
                });
            },
            back: function() {
                this.$router.go({name: 'home'});
            }
        }
    };
</script>