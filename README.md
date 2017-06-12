# Request Manager

A simple server which is capable of the following API requests listed below in "Sending Requests".

## Getting Started
Clone the repository.

### Prerequisites
Install the following software (instructions for linux machine, can be adjusted accordingly for windows).

Install node and redis-server
```
sudo apt-get install node
sudo apt-get install redis-server
```

cd into the project folder and install dependencies
```
npm install
```

### Running the code
Run redis server

```
redis-server
```

Run node server

```
node server.js
```

## Sending requests

API requests can be tested using cURL or Postman.

### API
This API will keep the request running for provided time on the server side. After the successful completion of the provided time it should return {"status":"ok"}.
```
GET api/request?connId=19&timeout=80
```
This API returns all the running requests on the server with their time left for completion. E.g {"2":"15","8":"10"} where 2 and 8 are the connIds and 15 and 10 is the time remaining for the requests to complete (in seconds).
```
GET api/serverStatus
```
This API will finish the running request with provided connId, so that the finished request returns {"status":"killed"} and the current request will return {"status":"ok"}. If no running request found with the provided connId on the server then the current request should return "status":"invalid connection Id : <connId>"}
```
PUT api/kill
payload - {"connId":12}
```

## Built With

* [Express](https://expressjs.com/) - Web framework for Nodejs
* [Node.js](https://nodejs.org/) - Javascript runtime
* [Redis](https://redis.io/) - In-memory data structure store
