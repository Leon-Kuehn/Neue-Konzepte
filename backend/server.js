import http from 'http'

const port = process.env.PORT || 3001

const handler = (_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok', message: 'Placeholder backend - add API here.' }))
}

http.createServer(handler).listen(port, () => {
  console.log(`Backend placeholder running on port ${port}`)
})
