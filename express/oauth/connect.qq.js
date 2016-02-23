var request = require('request');
var APP_ID = '101295012';
var APP_KEY = '03aeed3e6373ac773763b5b81bb798cf';
var AUTH_URL = 'https://graph.qq.com/oauth2.0';
var REDIRECTION_URI = 'http://wedding.jackyang.me/qq_login_callback.html';
/*
https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101295012&redirect_uri=http%3A%2F%2Fwedding.jackyang.me%2Flogin.html&state=test&scope=all
https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=101295012&client_secret=03aeed3e6373ac773763b5b81bb798cf&code=CBAD0B6FE19B2FC0116624B86416BC0B&redirect_uri=http%3A%2F%2Fwedding.jackyang.me%2Flogin.html
https://graph.qq.com/oauth2.0/me?access_token=0C501C4D58FDD8CD80238BA29E876611
https://graph.qq.com/user/get_user_info?access_token=0C501C4D58FDD8CD80238BA29E876611&oauth_consumer_key=101295012&openid=C556321FC9B2E9568B24D06654A4091C
*/

function buildQueryString(params) {
    var paramArray = [];
    for(var p in params) {
        paramArray.push(p + '=' + encodeURIComponent(params[p]));
    }
    return paramArray.join('&');
}

function accessTokenRequestUrl(code) {
    var params = {
        grant_type: 'authorization_code',
        client_id: APP_ID,
        client_secret: APP_KEY,
        redirect_uri: REDIRECTION_URI,
        code: code
    };
    return AUTH_URL + '/token?' + buildQueryString(params);
}

function openIdRequestUrl(accessToken) {
    return AUTH_URL + '/me?access_token=' + accessToken;
}

function userInfoRequestUrl(accessToken, openId) {
    var params = {
        access_token: accessToken,
        oauth_consumer_key: APP_ID,
        openid: openId
    };
    return 'https://graph.qq.com/user/get_user_info?' + buildQueryString(params);
}

function getAccessToken(authorizeCode) {
    return new Promise(function(resolve, reject) {
        var url = accessTokenRequestUrl(authorizeCode);
        console.log('getAccessToken url', url);

        request.get(url, function(error, response, body) {
            console.log('getAccessToken body', body);

            if(body.indexOf('callback') === -1) {
                var result = {};
                // access_token=0C501C4D58FDD8CD80238BA29E876611&expires_in=7776000&refresh_token=7AD04C993A0376F07BC6BE280BE6B0F8
                body.split('&').forEach(function(param) {
                    var pair = param.split('=');
                    result[pair[0]] = pair[1];
                });
                console.log('getAccessToken', result);
                resolve(result);
            } else {
                // callback( {"error":100020,"error_description":"code is reused error"} );
                var i1 = body.indexOf('{');
                var i2 = body.indexOf('}');
                var errorJSONString = body.substring(i1, i2 + 1);
                var error = JSON.parse(errorJSONString);
                reject(error);
            }
        });
    });
}

function getOpenId(accessToken) {
    return new Promise(function(resolve, reject) {
        var url = openIdRequestUrl(accessToken);
        console.log('getAccessToken url', url);
        request.get(url, function(error, response, body) {
            console.log('getOpenId body', body);

            // callback( {"client_id":"101295012","openid":"C556321FC9B2E9568B24D06654A4091C"} );
            // callback( {"error":100016,"error_description":"access token check failed"} );
            var i1 = body.indexOf('{');
            var i2 = body.indexOf('}');
            var JSONString = body.substring(i1, i2 + 1);
            var responseObj = JSON.parse(JSONString);

            console.log('getOpenId', responseObj);
            if(!responseObj.error) {
                resolve(responseObj);
            } else {
                reject(responseObj);
            }
        });
    });
}

function getUserInfo(accessToken, openId) {
    return new Promise(function(resolve, reject) {
        var url = userInfoRequestUrl(accessToken, openId);
        console.log('getUserInfo url', url);
        request.get(url, function(error, response, body) {
            console.log('getUserInfo body', body);
            // success: { "ret": 0, "msg": "", "is_lost":0, "nickname": "StupidJack",  ... "is_yellow_year_vip": "0" }
            // error: {"ret":-23,"msg":"token is invalid"}
            var response = JSON.parse(body);

            console.log('getUserInfo', response);

            if(response.ret === 0) {
                resolve(response);
            } else {
                reject(response);
            }
        });
    });
}

module.exports = {
    getAccessToken: getAccessToken,
    getOpenId: getOpenId,
    getUserInfo: getUserInfo
};