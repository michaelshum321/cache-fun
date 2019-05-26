import os
import sys
sys.path.append(os.path.abspath('../src/'))
import cache
import hashlib
def testWrite1():
  data = b'hellllloooo'
  hasher = hashlib.sha256()
  hasher.update(data)
  hashed = hasher.hexdigest()
  ret = cache.write(data)
  assert hashed == ret

def testWriteSame():
  data = b'testing'
  hasher = hashlib.sha256()
  hasher.update(data)
  expected = hasher.hexdigest()
  actual = cache.write(data)
  assert expected == actual
  actual = cache.write(data)
  assert expected == actual
  actual = cache.write(data)
  assert expected == actual

def testReadGood():
  data = b'goodies'
  filename = cache.write(data)
  actual = cache.read(filename)
  assert actual == data

def testReadBad():
  data = b'test123'
  actual = cache.read('')
  assert actual == None

  hashed = cache.write(data)
  actual = cache.read(hashed[:-1]+'q')
  assert actual == None



