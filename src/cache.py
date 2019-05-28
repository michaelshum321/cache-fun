import hashlib
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

  def write(self, data):
    hasher = hashlib.sha256()
    hasher.update(data)
    filename = hasher.hexdigest()
    filepath = self.path+'/'+filename
    if not os.path.isfile(filepath):
      # write file !!
      # f = os.open(filepath, os.O_CREAT|os.O_WRONLY)
      # then fdopen, write emtpy
      # close...

      #mmap
      with open(filepath, 'w+b') as f:
        f.write(len(data)*b'\0')
        f.flush()
        mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_WRITE)
        mm.flush()
        bytesToWrite = ''.join(map(chr,data))
        print('bytesWritten')
        print(bytesToWrite)
        mm.write(data)
        mm.flush()
        mm.close()
    return filename

  def read(self, hashStr):
    filepath = self.path+'/'+hashStr
    if not os.path.isfile(filepath):
      return None
    ret = None
    with open(filepath,'r+b') as f:
      mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
      ret = mm.read(mm.size())
      mm.close()

    return ret
