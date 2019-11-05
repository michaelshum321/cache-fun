const express = require('express')
const axios = require('axios')
const app = express()

app.use(express.raw({type:'*/*'}))

const port = process.env.PORT || 8080
const HEARTBEAT_TIME = process.env.HEARTBEAT_TIME || 10000
const LOADBALANCER_URL = process.env.LOADBALANCER_URL || 'localhost:8090'

const startHeartbeat = () => {
	console.log('started heartbeat')
	setInterval(() => {
		console.log('hb')
		axios
			.get(`http://${LOADBALANCER_URL}/hello`, {params: {port}})
			.catch((err) => console.warn(`Could not call heartbeat @ ${LOADBALANCER_URL}`))
	}, HEARTBEAT_TIME)
}

// not going to bother putting a 'hashmap' in its own class
const map = {}
app.post('/save/:key', (req,res) => {
	const key = req.params.key
	map[key] = req.body
	console.log(JSON.stringify(map))
	res.send()
})

app.get('/get/:id', (req,res) => {
	const id = req.params.id
	if (id in map) {
		res.send(map[id])
		return
	}
	return res.status(404).end()
})

app.listen(port, () => console.log(`cache listening on port ${port}!`))

// attempt to register cache initially
let count = 0
const register = () => {
	console.log(`attemping to register w/ ${LOADBALANCER_URL} using my port ${port}`)
	axios
		.get(`http://${LOADBALANCER_URL}/hello`, {params: {port}})
		.then(() => startHeartbeat())
		.catch((err) => {
			if (count < 10) { // can't do it in 10 tries? might as well quit - load balancer's probably not happy
				count++
				setTimeout(() => register(), 5000)
			}else{
				console.error(`Could not register with loadbalancer @ ${LOADBALANCER_URL}`)
				process.exit(1)
			}
		})
}
register()