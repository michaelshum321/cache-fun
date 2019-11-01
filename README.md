# cache-fun
another distributed, in-memory cache, for fun!

## Usage
1. Start up load balancer
```
cd loadbalancer
node index.js
```

2. In another terminal, start up cache(s)
```
cd cache
node index.js
```
If starting up multiple caches on a local machine, run this instead
```
port=8081 node index.js
```

At this point, your distributed, in-memory cache is ready for usage!
Hit the endpoints on the load balancer
#### POST /save
to save content. It will return a JSON as follows:
```
{id: 1234}
```
where the id should be stored for fetching later

#### GET /get/{id}
to fetch data using the id provided from `/save`. It will return a raw body, exactly like how `/save` received it. 
