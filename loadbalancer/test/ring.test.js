const r = require('../ring')

// mock Math.random 
test('add a node', () => {
	global.Math.random = () => 0.5
	const ring = new r(10)
	ring.addNode('myid')
	expect(ring.map[5]).toEqual('cachemyid')
})

test('add a file', () => {
	const ring = new r(10)
	ring.addFile(15)
	expect(ring.map[5]).toEqual(15)
})

test('add file and check exists', () => {
	const ring = new r(10)
	ring.addFile(15)
	expect(ring.exists(15)).toBeTruthy()
})

// test('add file1, add file2 with same key, check exists file1 fails and file2 works')

test('add node, file, and check get', () => {
	const ring = new r(10)
	ring.addNode('myid')
	ring.addFile(123)
	expect(ring.get(123)).toEqual('myid')
})

// test('add node1, node2, file, check get')

// test('add node, remove node')

// test('add file, remove file')