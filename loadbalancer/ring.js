// note: node and cache are used interchangeably 

function ring(size){
  this.size = size
  this.map = {} // file ring that maps index to file/node
  // TODO: there is probably a much better DS to use (Java STL?) to avoid iterting over all spots in ring on get(), but this shall suffice for now
  this.cacheMap = {} // map of cache id to ring index to easily remove node. 
  this.cachePrefix = 'cache' // used to signify that a value in the map is a node/cache
}

ring.prototype.addFile = function(key) {
  const index = key % this.size
  if (index in this.map) { // this should not happen, 
    // but may happen if:
    // 1. size is too small 
    // 2. hash algorithm is not uniform enough 
    // 3. just by chance 
    // 4. if `key` ranges are much smaller than this.size i.e. keys always range from 1-100 but this.size is 1000: `index = key % this.size` does nothing
    // 5. same file already in cache is added
    // if this does happen, new file should replace existing.  
    console.log(`${key} is replacing file @ ${index}, which has key ${key}`)
  }
  this.map[index] = key
}
/**
 * If cache evicts a file then lb hits cache and doesn't find file, this should be called to open up spots in ring
 */ 
ring.prototype.removeFile = function(key) {
  const index = key % this.size
  if (!(index in this.map)) { // shouldn't happen!
    console.log(`tried to remove file @ ${index} but not present`)
    return
  }
  // faster to use this than to `delete map[index]` and spot could be reused
  map[index] = null
}

/**
 * Assigning a node to a random spot seems to work better than trying to figure out evenly spaced node positioning
 */
ring.prototype.addNode = function(id) {
  let index = Math.floor(Math.random()*this.size)
  const lastIndex = (index === 0) ? this.size - 1 : index - 1 // used to check if all values have been searched to no availiable spot 
  while(index in this.map && 
  this.map[index] !== null && 
  lastIndex !== index) { // search for first empty spot
    index = (index+1)%this.size
  }
  if (lastIndex === index) { // could not find a spot in the ring! make ring bigger or add less files. 
    console.error('could not find spot in ring to add a node to!')
    return
  }
  this.map[index] = `${this.cachePrefix}${id}`
  this.cacheMap[id] = index
}

ring.prototype.removeNode = function(id) {
  if (!(id in this.cacheMap)) { // someone called removeNode incorrectly!! or program is borken :(
    console.log(`tried removing node ${id} from ring but it does not exist`)
    return
  }
  const index = this.cacheMap[id]
  this.map[index] = null
  delete this.cacheMap[id] // doesn't happen that often
}

// check if spot at index is a cache
ring.prototype.isCache = function(index) {
  if (index in this.map && typeof this.map[index] === 'string' && this.map[index].startsWith(this.cachePrefix)) {
    return this.map[index].replace(this.cachePrefix,'')
  }
  return false
}

ring.prototype.exists = function(key) {
  const index = key % this.size
  return index in this.map && this.map[index] === key
}

// using file key, get cache that file should be at
ring.prototype.get = function(key) {
  const index = key % this.size
  for(let i = 1; i < this.size; i++) { // iterate over all values, except self, in ring starting with index+1, looping back to 0 and then stopping at index-1
    const ret = this.isCache((i+index) % this.size)
    if (ret !== false) {
      return ret
    }
  }
  console.warn('there are no caches in ring!')
  return null
}

module.exports = ring