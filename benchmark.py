from cachefun.cache import Cache
import time
import hashlib
import cProfile
def writeALot():
  c = Cache('./target_tests')
  total = 0
  hasher = hashlib.sha256()
  for i in range(0,1000):
    hasher.update( bytes(i) )
    seed = hasher.digest()
    # print('seed: '+ seed + '\n')
    data = seed*10000
    startTime = time.time()
    c.write(data)
    total += time.time()-startTime
  print('totalTime:' + str(total))

writeALot()
#cProfile.run('writeALot()')
