#!/usr/bin/env python3
"""Static server that 404s dot-prefixed paths (.git, .claude) so local previews
match what a real static host serves."""
import sys, http.server, socketserver

class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        if any(p.startswith('.') for p in self.path.split('?')[0].split('/') if p):
            self.send_error(404, "Not Found")
            return None
        return super().send_head()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, fmt, *a):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % a))

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8488
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", port), Handler) as httpd:
    print(f"serving on http://localhost:{port}")
    httpd.serve_forever()
