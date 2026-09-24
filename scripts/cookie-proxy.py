import http.server, urllib.request, sys

PORT = int(sys.argv[1])
TOKEN_FILE = sys.argv[2]
TOK = open(TOKEN_FILE).read().strip()

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        req = urllib.request.Request('http://localhost:3002' + self.path)
        req.add_header('Cookie', 'orchid_session=' + TOK)
        try:
            r = urllib.request.urlopen(req, timeout=30)
            data, code = r.read(), r.status
        except urllib.error.HTTPError as e:
            data, code = e.read(), e.code
        except Exception:
            data, code = b'<h1>proxy err</h1>', 502
        self.send_response(code)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *a):
        pass

http.server.HTTPServer(('127.0.0.1', PORT), H).serve_forever()
