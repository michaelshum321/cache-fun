import os
import sys
sys.path.append(os.path.abspath('../src/'))
from cache import Cache
import hashlib

def testWrite1():
  data = b'hellllloooo'
  hasher = hashlib.sha256()
  hasher.update(data)
  expect = hasher.hexdigest()
  c = Cache()
  actual = c.write(data)
  assert expect == actual

def testWriteSame():
  data = b'testing'
  hasher = hashlib.sha256()
  hasher.update(data)
  expected = hasher.hexdigest()
  c = Cache()
  actual = c.write(data)
  assert expected == actual
  actual = c.write(data)
  assert expected == actual
  actual = c.write(data)
  assert expected == actual

def testReadGood():
  data = b'goodies'
  c = Cache()
  filename = c.write(data)
  actual = c.read(filename)
  assert actual == data

def testReadBad():
  data = b'test123'
  c = Cache()
  actual = c.read('')
  assert actual == None

  hashed = c.write(data)
  actual = c.read(hashed[:-1]+'q')
  assert actual == None



