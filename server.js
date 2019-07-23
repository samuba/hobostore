var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var marked = require('marked')
var Database = require('better-sqlite3')
var fs = require('fs')

const app = initExpress()
const dbFile = './.data/sqlite.db'
const db = initSqlite(dbFile)

app.post('/api/exec-multi', (req, res) => res.send(executeMultipleSql(req.body.statements)))

app.post('/api/exec', (req, res) => res.send(executeSql(req.body.sql, req.body.params)))

app.put('/api/exec', (req, res) => res.send(executeSql(req.body, [])))

app.get('/api/exec/:sql', (req, res) => res.send(executeSql(req.params.sql, [])))

app.get('/api/info', (req, res) => res.send(info()))

app.get('/api/dump', (req, res) => dump(x => res.send(x)))

app.get('/api/download-db', (req, res) => res.download(dbFile))

function dump(callback) {  
  function loop(sqls, i, dump) {
    const res = db.prepare(sqls[i].sql).all()
    dump.push({ table: sqls[i].table, content: res })
    i++
    if (i == sqls.length) callback(dump)
    else loop(sqls, i, dump) 
  }
  
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  loop(tables.map(x => { return { sql: "SELECT * from " + x.name, table: x.name }}), 0, [])
}

function info() {
  const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all()
  let sql = tables
    .map(x => "SELECT '" + x.name + "' as name, COUNT(*) as rows, $"+ x.name + " as schema from " + x.name + " UNION ")
    .reduce((x, y) => x + y)
  sql = sql.substr(0, sql.length - 6)
  
  let params = {}
  tables.forEach(x => params[x.name] = x.sql)
  return { tables: executeSql(sql, params).result }
}

function executeSql(sql, params) {
  params = params || []
  if (!sql) return { error: "no sql was given to execute" }
  sql = sql.trim()
  console.log("executing sql: " + sql + "\nwith params: ", params)
  try {
    if (isSelectQuery(sql)) {
      return { result: db.prepare(sql).all(params) }
    } 
    return { result: db.prepare(sql).run(params) } 
  } catch(e) {
    console.error(String(e))
    return { error: String(e) }
  }
}

function executeMultipleSql(statements) {
  const results = []
  console.log("executing sql statements:", statements)
  try {
    db.transaction(() => statements.forEach(x => {
      const params = x.params || {}
      if (isSelectQuery(x.sql)) {
          results.push({ result: db.prepare(x.sql).all(params) })
      } else {
        results.push({ result: db.prepare(x.sql).run(params) })
      }
    }))()
    return results
  } catch(e) {
    console.error(String(e))
    return { error: String(e) }
  }
}

app.get("/", (req, res) => { 
  let content = marked(fs.readFileSync('./README.md', 'utf8'))
  res.send( '<div class="markdown-body" style="margin: 0 auto 0 auto; max-width: 850px; padding: 0 12px 50px 12px">'
     + '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css">' 
     + content 
     + '</div>') 
})

function isSelectQuery(sql) { return sql.toLowerCase().startsWith("select ") }

function initExpress() {
  var app = express()
  app.use(cors())
  app.use(bodyParser.text())
  app.use(bodyParser.json())
  app.use("/explore", express.static('public'))
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") && req.get("api-key") != process.env.API_KEY && req.query['api-key'] != process.env.API_KEY) {
      res.send("access to /api without valid api-key in header is not allowed", 401)
    } 
    else next()
  })
  return app 
}

function initSqlite(dbFile) {
  if (!fs.existsSync(dbFile)) fs.writeFileSync("./test")
  var db = new Database(dbFile, { verbose: console.log })
  db.pragma("foreign_keys = ON")
  return db
} 

app.listen(process.env.PORT, () => console.log('NodeJS is listenning..'))
