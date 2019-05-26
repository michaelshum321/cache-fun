import hashlib

files = {}

def write(data):
  hasher = hashlib.sha256()
  hasher.update(data)
  filename = hasher.hexdigest()
  files[filename] = data
  return filename

def read(hashStr):
  ret = files[hashStr] if hashStr in files else None
  return ret
