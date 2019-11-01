const express = require('express')
const axios = require('axios')
const xxhash = require('xxhashjs')
const r = require('./ring')
const app = express()
app.use(express.raw({type:'*/*'}))

const port = process.env.PORT || 8090
const HEARTBEAT_TIME = process.env.HEARTBEAT_TIME || 10000
const CACHE_TIMEOUT = process.env.CACHE_TIMEOUT || 5000
const FILE_MAX_COUNT = process.env.FILE_MAX_COUNT || 1000

const seed = 0x1337
const hasher = xxhash.h64(seed)

const ring = new r(FILE_MAX_COUNT)

// TODO: split up logic and routing 
// TODO: refactor cache heartbeat monitoring code into a different file
//=== heartbeat handling===
/**
 * Hitting '/hello' and successful REST to cache counts as heartbeat
 * 
 */
/* TODO: convert cache ip:port to unix ms to 
 cache id : {last: unix ms, url: whatever:8080}
*/
const caches = {} // cache ip:port to unix ms timestamp of most recent heartbeat

// updates cache's last used time when posting/getting on cache gives response
const updateCacheHb = (ip) => {
  if (!(ip in caches)) { // shouldn't happen - would be security risk in production.
    console.log(`${ip} is not registered as a cache, but is being updated in cache list`)
  }
  caches[ip] = Date.now()
}

// every few seconds, check servers to see if they have sent a heartbeat. 
// if a server is stale, kick it out and adjust file ring 
setInterval(() => {
  const servers = Object.keys(caches)
  const toRemove = []
  const curTime = Date.now();
  servers.forEach((s) => {
    const lastTime = caches[s]
    if (curTime - lastTime > HEARTBEAT_TIME) {
      toRemove.push(s)
    }
  })
  // remove stale caches
  toRemove.forEach((r) => {
    delete caches[r]
    ring.removeNode(r)
  })
}, Math.floor(HEARTBEAT_TIME*1.1)) // * 1.1 to prevent case where heartbeat of cache and stale check occur at same time 
//=== end heartbeat handling===

/**
 * This endpoint acts as a heartbeat for caches and also to allow new caches to be discovered.
 * In production, this should be protected by certs of some sort to ensure cache saying hi is genuine
 * 
 * @param: port - port to access cache at
 */
app.get('/hello', (req, res) => {
  // load balancer should be on same network as cache, so reading x-forwarded-for header (nginx) is not needed
  // req.headers['x-forwarded-for'] || req.connection.remoteAddress
  // .replace(...) is for stripping off ipv6 content 
  const ip = `${req.connection.remoteAddress.replace(/^.*:/, '')}:${req.query.port}`
  console.log('hello '+ip)
  caches[ip] = Date.now()
  ring.addNode(ip)
  res.send()
})

/**
 * This is an endpoint for other servers to get their cached goodies
 */
app.get('/get/:id', (req, res) => {
  const id = parseInt(req.params.id)
  if (id === NaN) { 
    res.status(400).json({error:'no id given'})
    return
  }

  // check if exists
  if (!ring.exists(id)) {
    res.status(404).end()
    return
  }

  // get which cache to check
  const url = ring.get(parseInt(id))

  // if exists, fetch from cache
  axios.get(`http://${url}/get/${id}`, {timeout: CACHE_TIMEOUT})
    .then((response) => {
      updateCacheHb(url)
      res.send(response.data)
      return
    })
    .catch((err) => {
      if (err.code !== 'ECONNABORTED') { // if it did not timeout, cache is still running
        updateCacheHb(url)
        ring.removeFile(id)
      }
      res.status(404).end()
      return
    })
})

/**
 * This is an endpoint for other servers to save their goodies to cache
 */
app.post('/save',(req,res) => {
  // Buffer
  const data = req.body
  if (!data.length) {
    res.status(400).json({error: 'no data posted'})
    return
  }
  
  // get hash of data
  const id = hasher.update(data).digest().toNumber()
  
  // shouldn't do this because cache may have evicted item
  // if (ring.exists(id)) {
  //   res.send({id})
  //   return
  // }

  // check which cache to write file to
  const url = ring.get(id)
  console.log('posting to '+ `http://${url}/save/${id}`)
  axios.post(`http://${url}/save/${id}`,data,{timeout: CACHE_TIMEOUT})
    .then(() => {
      ring.addFile(id)
      updateCacheHb(url)
      res.send({id})
    })
    .catch((err) => {
      console.log(err.message)
      if (err.code !== 'ECONNABORTED') { // if it did not timeout, cache is still running
        updateCacheHb(url)
      }
      res.status(400).json({error:'Could not save'})
    })
})

app.listen(port, () => console.log(`Loadbalancer listening on port ${port}!`))

