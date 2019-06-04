from cachefun.cache import Cache
#import hashlib
import xxhash

# do not put last folder's /, i.e. no foldername/. just foldername
testFolderPath = './target_tests'

def testWrite1():
  data = b'hellllloooo'
  #hasher = hashlib.sha256()
  hasher = xxhash.xxh64()
  hasher.update(data)
  expect = hasher.hexdigest()
  c = Cache(testFolderPath)
  # check filename
  actual = c.write(data)
  assert expect == actual

  # check contents of file
  with open(testFolderPath+'/'+actual, 'r+b') as f:
    actual = f.read(len(data))
  print('actual')
  print(actual)
  assert bytearray(data) == bytearray(actual)

def testWriteSame():
  data = b'testing'

  hasher = xxhash.xxh64()
  #hasher = hashlib.sha256()
  hasher.update(data)
  expected = hasher.hexdigest()
  c = Cache(testFolderPath)
  actual = c.write(data)
  assert expected == actual
  # check contents of file
  with open(testFolderPath+'/'+actual, 'r+b') as f:
    actual = f.read(len(data))
  assert bytearray(actual) == bytearray(data)

  actual = c.write(data)
  assert expected == actual
  # check contents of file
  with open(testFolderPath+'/'+actual, 'r+b') as f:
    actual = f.read(len(data))
  assert bytearray(actual) == bytearray(data)

def testReadGood():
  data = b'goodies'
  c = Cache(testFolderPath)
  filename = c.write(data)
  actual = c.read(filename)
  assert bytearray(actual) == bytearray(data)

def testReadBad():
  data = b'test123'
  c = Cache(testFolderPath)
  actual = c.read('')
  assert actual is None

  hashed = c.write(data)
  actual = c.read(hashed[:-1]+'q')
  assert actual is None

def main():
  testWrite1()
  testWriteSame()
  testReadGood()
  testReadBad()

main()
