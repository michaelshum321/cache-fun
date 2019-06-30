const express = require('express')
const axios = require('axios')
const xxhash = require('xxhash')
const app = express()
const port = process.env.PORT || 8090
const cacheUrl = process.env.CACHE_URL || 'http://localhost:8080'

const files = {}

// TODO: handle not in cache
app.get('/get', (req, res) => {
  const id = req.query.id
  if (!id) {
    res.status(400).end({error:'no id given'})
  }

  // check if exists
  if (!(id in hashedFiles)) {
    res.status(404).send()
  }
  // if exists, fetch from cache
  axios.get(cacheUrl+'/get/'+id, {timeout:10000})
    .then((response) => {
      // TODO parse err in cache response ?
      res.send(response.data)
    })
    .catch((err) => {
      res.status(400).send({error:'cache request failed'})
      console.error(err)
    })
})

app.post('/save',(req,res) => {
  // get file
  const data = req.body
  if (!data) {
    res.send({error: 'no data posted'})
  }
  // hash
  const hasher = new xxhash();
  const buf = Buffer.from(data)
  const hash = hasher.hash64(buf)
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
      console.log(err);
      res.status(400).send({error:'cache request failed'})
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

