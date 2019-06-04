import hashlib
import xxhash

class Cache:

  def __init__(self):
    self.files = {}

  def write(self, data):
    #hasher = hashlib.sha256()
    hasher = xxhash.xxh64()
    hasher.update(data)
    filename = hasher.hexdigest()
    self.files[filename] = data
    return filename

  def read(self, hashStr):
    ret = self.files[hashStr] if hashStr in self.files else None
    return ret
