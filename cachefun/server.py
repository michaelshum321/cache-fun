from flask import Flask, make_response, request
from cachefun.cache import Cache
app = Flask(__name__)


cache = Cache('./target_tests')

@app.route('/get/<string:filename>')
def get(filename):
  data, fn = cache.read(filename)
  if data is None:
    return '',404
  print("filename: "+fn)
  resp = make_response(data)
  #resp.headers["Content-Disposition"] = "attachment; filename=wow"
  return resp

@app.route('/post', methods = ['POST'])
def save():
  inFile = request.files['file']
  inFile.seek(0,2)
  inFileLen = inFile.tell()
  inFile.seek(0)

  if not inFile or inFileLen == 0:
    return 'No file'

  inFile.seek(0)
  contents = inFile.read()
  #ret = cache.write(contents)
  ret = cache.write(contents, inFile.filename)
  if ret is None:
    return None, 304
  return ret
