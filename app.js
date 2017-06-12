var express = require('express');
var redis = require('redis');
var async = require('async');
var bodyParser = require('body-parser');

var app = express();
var client = redis.createClient(6379, '127.0.0.1');
var router = express.Router();
router.use(bodyParser.json());

var all_requests = {
    response: {},
    timeout: {}
};

router.get('/request', function(req, res) {
    all_requests['response'][req.query.connId] = res;
    client.set(req.query.connId, req.query.timeout, 'EX', req.query.timeout, function(error) {
        if (error) {
            throw error;
        }
        else {
            all_requests['timeout'][req.query.connId] = setTimeout(function() {
                res.json({"status": "ok"});
                return;
            }, 1000 * req.query.timeout);
        }
    });
});

router.get('/serverStatus', function(req, res) {   
    // function to fetch keys in redis recursively using SCAN
    function scan(cursor, resultSet, scanCallback) {
        client.scan(cursor, 'MATCH', '*', 'COUNT', '100', function(error, result) {
            cursor = result[0];
            var keys = result[1];
            keys.forEach(function(key, i) {
                resultSet.push(key);
            })
            if (cursor == 0) {
                scanCallback(resultSet);
            }
            else {
                return scan(cursor, resultSet, scanCallback);
            }
        });
    }

    scan(0, [], function(resultSet) {
        var uniqueKeys = Array.from(new Set(resultSet));
        async.map(uniqueKeys, function(key, callback) {
            client.get(key, function(error, response) {
                if (error) 
                    throw error;
                var json = {};
                json['connId'] = key;
                client.ttl(key, function(error, time) {
                    if (error) 
                        throw error;
                    json['timerem'] = time;
                    callback(null, json);
                });
                
            });
        }, function(error, results) {
            if (error)
                return console.log(error);
            var jsonResult = results.reduce(function(obj, item) {
                obj[item.connId] = item.timerem;
                return obj;
            }, {});
            res.json(jsonResult);
            return;
        });
    }); 
});

router.put('/kill', function(req, res) {
    var invalid_id = true;
    if (req.body.connId in all_requests['response']) {
        invalid_id = false;
        all_requests['response'][req.body.connId].json({"status": "killed"});
        clearTimeout(all_requests['timeout'][req.body.connId]);
        delete all_requests['response'][req.body.connId];
        client.del(req.body.connId);
    }
    if (invalid_id) { 
        res.json({"status": "invalid connection id: "  + req.body.connId});
        return;
    }
    res.json({"status": "ok"});
    return;
});

app.use('/api', router);

module.exports = app;