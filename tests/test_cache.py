import os
import sys
sys.path.append(os.path.abspath('../src/'))
from cache import Cache
import hashlib

# do not put last folder's /, i.e. no foldername/. just foldername
testFolderPath = '../target_tests'

def testWrite1():
  data = b'hellllloooo'
  hasher = hashlib.sha256()
  hasher.update(data)
  expect = hasher.hexdigest()
  c = Cache(testFolderPath)
  # check filename
  actual = c.write(data)
  assert expect == actual

  # check contents of file
  with open(testFolderPath+'/'+actual, 'r') as f:
    actual = f.read(len(data))
  assert data == actual

def testWriteSame():
  data = b'testing'
  hasher = hashlib.sha256()
  hasher.update(data)
  expected = hasher.hexdigest()
  c = Cache(testFolderPath)
  actual = c.write(data)
  assert expected == actual
  # check contents of file
  with open(testFolderPath+'/'+actual, 'r') as f:
    actual = f.read(len(data))
  assert actual == data

  actual = c.write(data)
  assert expected == actual
  # check contents of file
  with open(testFolderPath+'/'+actual, 'r') as f:
    actual = f.read(len(data))


def testReadGood():
  data = b'goodies'
  c = Cache(testFolderPath)
  filename = c.write(data)
  actual = c.read(filename)
  assert actual == data

def testReadBad():
  data = b'test123'
  c = Cache(testFolderPath)
  actual = c.read('')
  assert actual == None

  hashed = c.write(data)
  actual = c.read(hashed[:-1]+'q')
  assert actual == None



