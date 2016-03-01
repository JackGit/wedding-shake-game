var AV = require('avoscloud-sdk');
var Admin = AV.Object.extend('Admin');

var adminDAO = {
    getUser: function(user) {
        var adminQueryObj = new AV.Query('Admin');
        adminQueryObj.equalTo('userName', user.userName);
        adminQueryObj.equalTo('password', user.password);
        return adminQueryObj.first();
    },
    getUserById: function(userId) {
        var adminQueryObj = new AV.Query('Admin');
        return adminQueryObj.get(userId);
    }
};

module.exports = adminDAO;