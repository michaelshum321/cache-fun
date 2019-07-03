const express = require('express')
const axios = require('axios')
const xxhash = require('xxhashjs')
const app = express()
const port = process.env.PORT || 8090
const cacheUrl = process.env.CACHE_URL || 'http://localhost:8080'
const seed = 0x1337
const files = {}

app.use(express.json())
// TODO: handle not in cache
app.get('/get', (req, res) => {
  const id = req.query.id
  if (!id) {
    res.status(400).json({error:'no id given'})
    return
  }

  // check if exists
  if (!(id in files)) {
    res.status(404).end()
    return
  }
  // if exists, fetch from cache
  axios.get(cacheUrl+'/get/'+id, {timeout:10000})
    .then((response) => {
      // TODO parse err in cache response ?
      res.send(response.data)
      return
    })
    .catch((err) => {
      res.status(400).json({error:'cache request failed'})
      return
    })
})

app.post('/save',(req,res) => {
  // get file
  const data = req.body
  console.log(req.body)
  if (!data) {
    res.status(400).json({error: 'no data posted'})
    return
  }
  // hash

  const hasher = xxhash.h64(seed)
  const hash = hasher.update(JSON.stringify(data)).digest().toString(16)
  console.log('hash',typeof(hash),hash)
  if (hash in files) {
    res.send({id:hash})
    return
  }
  // post to cache
  axios.post(cacheUrl+'/save/'+hash,data,{timeout:10000})
    .then(() => {
      files[hash] = true
      res.send({id:hash})
    })
    .catch((err) => {
      res.status(400).json({error:'cache request failed'})
    })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

