var APP_ID = '101295012';
var APP_KEY = '03aeed3e6373ac773763b5b81bb798cf';
var AUTH_URL = 'https://graph.qq.com/oauth2.0';
var ACCESS_TOKEN = '';
var REDIRECTION_URI = '';
/*
https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101295012&redirect_uri=http%3A%2F%2Fwedding.jackyang.me%2Flogin.html&state=test&scope=all
https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=101295012&client_secret=03aeed3e6373ac773763b5b81bb798cf&code=9CAD0FCD12FE8E4DCB817350993E54C7&redirect_uri=http%3A%2F%2Fwedding.jackyang.me%2Flogin.html
https://graph.qq.com/oauth2.0/me?access_token=0C501C4D58FDD8CD80238BA29E876611
https://graph.qq.com/user/get_user_info?access_token=0C501C4D58FDD8CD80238BA29E876611&oauth_consumer_key=101295012&openid=C556321FC9B2E9568B24D06654A4091C
*/

function buildGetParams(params) {
    var paramArray = [];
    for(var p in params) {
        paramArray.push(p + '=' + encodeURIComponent(params[p]));
    }
    return paramArray.join('&');
}

module.exports = {
    setAcessToken: function(value) {
        ACCESS_TOKEN = value;
    },
    setRedirectURI: function(value) {
        REDIRECTION_URI = value;
    },
    // 1
    getAuthorizeUrl: function() {
        var params = {
            response_type: 'code',
            client_id: APP_ID,
            redirect_uri: REDIRECTION_URI,
            state: 'test',
            scope: 'all'
        };
        return AUTH_URL + '/authorize?' + buildGetParams(params);
    },
    // 2
    getAccessTokenRequestUrl: function(code) {
        var params = {
            grant_type: 'authorization_code',
            client_id: APP_ID,
            client_secret: APP_KEY,
            redirect_uri: REDIRECTION_URI,
            code: code
        };
        return AUTH_URL + '/token?' + buildGetParams(params);
    },
    // 3
    getOpenIdRequestUrl: function() {
        return AUTH_URL + '/me?access_token=' + ACCESS_TOKEN;
    },
    getUserInfoRequestUrl: function(openId) {
        var params = {
            access_token: ACCESS_TOKEN,
            oauth_consumer_key: APP_ID,
            openid: openId
        };
        return 'https://graph.qq.com/user/get_user_info?' + buildGetParams(params);
    }
};