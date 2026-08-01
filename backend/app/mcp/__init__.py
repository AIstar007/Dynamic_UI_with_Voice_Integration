"""MCP integration layer.

Dedicated, asynchronous clients that discover and invoke the existing airline
MCP tools. No mock airline data lives here — every client is a thin, resilient
adapter over the real MCP server.
"""
