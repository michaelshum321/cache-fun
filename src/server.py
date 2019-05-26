from flask import Flask, make_response, request
from cache import Cache
app = Flask(__name__)


cache = Cache()

@app.route('/get/<string:filename>')
def get(filename):
  data = cache.get(filename)
  if data is None:
    return ''
  resp = make_response(data)
  resp.headers["Content-Disposition"] = "attachment; filename=wow"
  return resp

@app.route('/post', methods = ['POST'])
def save():
  reqFile = request.files['data_file']
  if not reqFile:
    return 'No file'
  contents = reqFile.stream.read()
  ret = cache.write(contents)
  if ret is None:
    return ''
  return ret
