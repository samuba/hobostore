var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var marked = require('marked')

var app = express()
app.use(cors())
app.use(bodyParser.text())
app.use(bodyParser.json())
app.use("/explore", express.static('public'))
app.use((req, res, next) => {
  if (req.path.startsWith("/api") && req.get("api-key") != process.env.API_KEY) {
    res.send("access to /api without valid api-key in header is not allowed", 401)
  } 
  else next()
})


// init sqlite db
var fs = require('fs')
var dbFile = './.data/sqlite.db'
var exists = fs.existsSync(dbFile)
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(dbFile)
db.exec("PRAGMA foreign_keys = ON")

info((x) => console.log(x))

app.post('/api/exec', (req, res) => executeSql(req.body.sql, req.body.params, x => res.send(x)))

app.put('/api/exec', (req, res) => executeSql(req.body, [], x => res.send(x)))

app.get('/api/exec/:sql', (req, res) => executeSql(req.params.sql, [], x => res.send(x)))

app.get('/api/info', (req, res) => info(x => res.send(x)))

app.get('/api/dump', (req, res) => dump(x => res.send(x)))

function dump(callback) {  
  function loop(sqls, i, dump) {
    db.all(sqls[i].sql, (err, res) => { 
      dump.push({ table: sqls[i].table, content: res })
      i++
      if (i == sqls.length) callback(dump)
      else loop(sqls, i, dump) 
    })
  }
  
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    loop(tables.map(x => { return { sql: "SELECT * from " + x.name, table: x.name }}), 0, [])
  }) 
}

function info(callback) {
  db.all("SELECT name, sql FROM sqlite_master WHERE type='table'", (err, tables) => {
    let sql = tables
      .map(x => "SELECT '" + x.name + "' as name, COUNT(*) as rows, $"+ x.name + " as schema from " + x.name + " UNION ")
      .reduce((x, y) => x + y)
    sql = sql.substr(0, sql.length - 6)
    
    let params = {}
    tables.forEach(x => params["$"+x.name] = x.sql)
    
    executeSql(sql, params, x => callback({ tables: x.result }))
  }) 
}

function executeSql(sql, params, callback) {
  params = params || []
  if (!sql) return callback({ error: "no sql was given to execute" })
  sql = sql.trim()

  if (sql.toLowerCase().startsWith("select ")) {
    console.log("executing sql: " + sql + "\nwith params: ", params)
     db.all(sql, params, (err, rows) => {
       console.log("error", err)
       callback({ result: rows, error: err ? err.stack : undefined })
     })
  } else {
    //sql = "PRAGMA foreign_keys = ON; \n" + sql + ";"
    console.log("executing sql: " + sql + "\nwith params: ", params)
    db.serialize(() => db.run(sql, params, err => { 
      console.log("error", err)
      callback({ result: err ? "failed" : "ok", error: err ? err.stack : undefined })
    }))
  } 
}

app.get("/", (req, res) => { 
  let content = marked(fs.readFileSync('./README.md', 'utf8'))
  res.send( '<div class="markdown-body" style="margin: 0 auto 0 auto; max-width: 850px; padding: 0 12px 0 12px">'
     + '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css">' 
     + content 
     + '</div>') 
})

app.listen(process.env.PORT, () => console.log('NodeJS is listenning..'))
