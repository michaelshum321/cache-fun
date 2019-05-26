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
      with open(filepath, 'w') as f:
        f.write(len(data)*b'\0')
        f.flush()
        mm = mmap.mmap(f.fileno(), 0)
        mm.flush()
        mm.write(''.join(map(chr, data)))
        mm.close()
    return filename

  def read(self, hashStr):
    filepath = self.path+'/'+hashStr
    if not os.path.isfile(filepath):
      return None
    ret = None
    with open(filepath,'r') as f:
      mm = mmap.mmap(f.fileno(), 0)
      ret = bytearray(mm.read(mm.size()))
      mm.close()

    return ret
