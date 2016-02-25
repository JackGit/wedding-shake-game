<style scoped>
    .avatar-container {
        padding: 50px 0 30px 0;
    }

    .avatar {
        border-radius: 50%;
        width: 80px;
        height: 80px;
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

        <div class="container" v-if="mode === 'read'">
            <div class="row">
                <div class="col s12 avatar-container">
                    <div class="col s12 center-align">
                        <img :src="player.avatarImageUrl" class="avatar"/>
                        <i class="material-icons right grey-text fa fa-pencil" style="position: absolute;" @click="edit()"></i>
                    </div>
                    <h5 class="center-align">{{player.userName}}</h5>
                    <h6 class="center-align">{{player.userType}} GUEST</h6>
                </div>
            </div>
            <div class="row">
                <a class="col s12 waves-effect waves-light btn btn-large red white-text" @click="quit()">Quit</a>
            </div>
        </div>

        <div class="container" v-if="mode === 'edit'">
            <div class="row">
                <div class="col s12">
                    <div class="row">
                        <h6 class="grey-text" _v-ae9f8a82="">EDIT PROFILE</h6>
                    </div>
                    <div class="row">
                        <div class="input-field col s12">
                            <input id="profile-page-user-name-input" type="text" value="{{player.userName}}" v-el:user-name>
                            <label for="profile-page-user-name-input" class="active">User Name</label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s12">
                            <select v-el:user-type>
                                <option value="" disabled>Choose your option</option>
                                <option value="BRIDE" :selected="player.userType === 'BRIDE'">Bride Guest</option>
                                <option value="GROOM" :selected="player.userType === 'GROOM'">Groom Guest</option>
                            </select>
                            <label>User Type</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <a class="col s12 waves-effect waves-light btn btn-large white red-text" @click="submitEdit()">OK</a>
            </div>
        </div>
    </div>
</template>

<script>
    var store = require('../../store');
    var Vue = require('vue');

    module.exports = {
        data: function() {
            return {
                mode: 'read'
            }
        },

        computed: {
            player: function() {
                return store.state.player.currentPlayer;
            }
        },

        ready: function() {
            store.actions.getUserDetails(store.state.player.currentPlayer.objectId);
        },

        methods: {
            quit: function() {
                store.actions.signout();
                this.$router.go({name: 'login'});
            },
            edit: function() {
                this.mode = 'edit';
                Vue.nextTick(function() {
                    $('select').material_select();
                });
            },
            submitEdit: function() {
                var that = this;
                var user = {
                    objectId: store.state.player.currentPlayer.objectId,
                    userName: this.$els.userName.value,
                    userType: this.$els.userType.value
                };
                store.actions.updateUserDetails(user).then(function() {
                    that.mode = 'read';
                    Materialize.toast('update successfully', 1000);
                }, function() {
                    Materialize.toast('update failed', 1000);
                });
            },
            cancelEdit: function() {
                this.mode = 'read';
            },
            back: function() {
                if(this.mode === 'read') {
                    this.$router.go({name: 'home'});
                } else {
                    this.mode = 'read';
                }
            }
        }
    };
</script>