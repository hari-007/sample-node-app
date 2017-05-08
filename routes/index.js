'use strict';

var express = require('express');
var router = express.Router();

let RestClient = require('node-rest-client').Client;
let restClient = new RestClient();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'HARI' });
});

router.get('/v1/login', function(req, res, next) {
        let apiEndPoint = "";
        let uaaEndPoint = "";
        let sessionObj = {};

        let args = {
            'headers': {
                'Accept': 'application/json;charset=utf-8',
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Authorization': 'Basic Y2Y6',
                'X-UAA-Endpoint': apiEndPoint,
                'rejectUnauthorized': false,
                'requestCert': false,
                'agent': false
            },
        };

        let decodeusername = "";
        let decodepassword = "";

        restClient.post(apiEndPoint+"/oauth/token?grant_type=password&username=" + decodeusername+ "&password=" + decodepassword, args, function (authData, response) {
            if(response.statusCode === 200 && authData.access_token) {
              
              console.log(authData);

                let httpOptions = { 
                    headers: {
                        'Authorization': 'bearer ' + authData.access_token
                    }
                };
                restClient.get(apiEndPoint + '/userinfo',httpOptions, function (usrData, response) {
                      console.log(usrData);

                    if(response.statusCode === 200 && usrData.user_id && req.session) {
                        res.send({expires_in: authData.expires_in});
                    }
                    else {
                        res.send({'error':'Something went wrong. Please try again! '});
                    }
                }).on('error', function (err) {
                    res.send({'error':'Something went wrong. Please try again! '});
                });
            } else if(authData && authData.hasOwnProperty('error') && authData.hasOwnProperty('error_description') && authData.error_description == "Bad credentials"){
                res.send({'not_auth': 'Invalid credentials. Please try again!'});
            } else if(authData && authData.hasOwnProperty('error') && authData.hasOwnProperty('error_description') && authData.error_description){
                res.send({'not_auth': authData.error_description});
            } else {
                res.send({'not_auth': 'Invalid credentials. Please try again!'});
            }
        })
});

module.exports = router;
