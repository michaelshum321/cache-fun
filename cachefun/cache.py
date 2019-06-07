import hashlib
import xxhash
import os
class Cache:

  def __init__(self):
    self.files = {}
    fsStats = os.statvfs()
    self.freeSpace = fsStats.f_bsize*fsStats.f_bavail

  def write(self, data):
    if self.freeSpace < len(data):
      print("NOT ENOUGH SPACE!!!")
    #hasher = hashlib.sha256()
    hasher = xxhash.xxh64()
    hasher.update(data)
    filename = hasher.hexdigest()
    self.files[filename] = data
    self.freeSpace -= len(data)
    return filename

  def read(self, hashStr):
    ret = self.files[hashStr] if hashStr in self.files else None
    return ret
