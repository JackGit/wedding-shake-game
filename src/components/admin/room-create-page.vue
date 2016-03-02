<style>

</style>

<template>
    <div>
        <div class="navbar-fixed">
            <nav>
                <div class="nav-wrapper red lighten-2">
                    <a class="brand-logo center">创建房间</a>
                    <ul class="left">
                        <li><a v-link="{name:'home'}"><i class="material-icons fa fa-angle-left"></i></a></li>
                    </ul>
                </div>
            </nav>
        </div>

        <div class="section">
            <div class="section-header">
                <div class="container">
                    <h6>创建房间</h6>
                </div>
            </div>
            <div class="section-content">
                <div class="card no-shadow">
                    <div class="card-content">
                        <div class="row">
                            <div class="col s12">
                                <div class="row">
                                    <div class="input-field col s12">
                                        <input id="roomCreatePageRoomName" type="text" value="{{room.roomName}}" v-el:room-name>
                                        <label for="roomCreatePageRoomName" class="active">房间名</label>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="input-field col s12">
                                        <textarea id="roomEidtPageRoomDescription" class="materialize-textarea" v-el:room-description>{{room.roomDescription}}</textarea>
                                        <label for="roomEidtPageRoomDescription" class="active">房间描述</label>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="input-field col s12">
                                        <input id="roomCreatePageRoomSize" type="text" value="{{room.roomSize}}" v-el:room-size>
                                        <label for="roomCreatePageRoomSize" class="active">房间大小</label>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="input-field col s12">
                                        <select v-el:room-color>
                                            <option value="" disabled selected>请选择颜色</option>
                                            <option value="#F56937">Red</option>
                                            <option value="#F79A3D">Orange</option>
                                            <option value="#48CCD0">Teal</option>
                                            <option value="#90DDE3">Light Blue</option>
                                        </select>
                                        <label>房间颜色</label>
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
                <a class="col s12 waves-effect waves-light btn btn-large red white-text" @click="submit()">创建</a>
            </div>
        </div>
    </div>
</template>

<script>
    module.exports = {

        data: function() {
            return {
                room: {
                    roomName: '',
                    roomDescription: '',
                    roomSize: 10,
                    roomColor: ''
                }
            };
        },

        ready: function() {
            $('select').material_select();
        },

        methods: {
            submit : function() {
                var router = this.$router;
                var room = {
                    roomName: this.$els.roomName.value,
                    roomDescription: this.$els.roomDescription.value,
                    roomSize: Number.parseInt(this.$els.roomSize.value),
                    roomColor: this.$els.roomColor.value
                };

                store.actions.createRoom(room).then(function() {
                    Materialize.toast('创建成功', 1000);
                    router.go({name: 'home'});
                }, function() {
                    Materialize.toast('创建失败', 1000);
                });
            }
        },

        route: {
            canActivate: function(transition) {
                if(!localStorage.adminUserId)
                    transition.redirect({name: 'login'});
                else {
                    store.actions.checkAdminUser(localStorage.adminUserId).then(function() {
                        transition.next();
                    }, function() {
                        transition.redirect({name: 'login'});
                    });
                }
            }
        }
    };
</script>