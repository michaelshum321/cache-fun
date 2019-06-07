#import hashlib
import xxhash
import mmap
import os
class Cache:

  def __init__(self, path):
    self.files = {}
    if path[-1] == '/':
      path = path[:-1]
    self.path = path
    if not os.path.exists(path):
      os.makedirs(path)
    fsStats = os.statvfs()
    self.freeSpace = fsStats.f_bsize*fsStats.f_bavail
    self.blkSize = fsStats.f_bsize
  def write(self, data, filename):
    if self.freeSpace - len(data) < self.blkSize:
      print("NOT ENOUGH SPACE!!!")
    hasher = xxhash.xxh64()
    #hasher = hashlib.sha256()
    hasher.update(data)
    hashed = hasher.hexdigest()
    filepath = self.path+'/'+hashed
    if not os.path.isfile(filepath):
      # write file
      with open(filepath, 'w+b') as f:
        f.write(len(data)*b'\0')
        f.flush()
        mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_WRITE)
        mm.flush()
        # bytesToWrite = ''.join(map(chr,data))
        #print('bytesWritten')
        #print(bytesToWrite)
        mm.write(data)
        mm.flush()
        mm.close()
      self.files[hashed] = filename
    self.freeSpace -= len(data)
    return filename

  def read(self, hashStr):
    filepath = self.path+'/'+hashStr
    if not os.path.isfile(filepath):
      return None, None
    ret = None
    with open(filepath,'r+b') as f:
      mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
      ret = mm.read(mm.size())
      mm.close()
    filename = self.files[hashStr]
    return ret,filename
