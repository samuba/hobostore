var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var marked = require('marked')

var app = express()
app.use(cors())
app.use(bodyParser.text())

// init sqlite db
var fs = require('fs')
var dbFile = './.data/sqlite.db'
var exists = fs.existsSync(dbFile)
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(dbFile)

db.serialize(function(){ 
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT)')
    console.log('New table Dreams created!')
    db.serialize(() => db.run('INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")'))
  } 
}) 

info((x) => console.log(x))

app.put('/exec', (req, res) => executeSql(req.body, x => res.send(x)))

app.get('/exec/:sql', (req, res) => executeSql(req.params.sql, x => res.send(x)))

app.get('/info', (req, res) => info(x => res.send(x)))

app.get('/dump', (req, res) => dump(x => res.send(x)))

function dump(callback) {  
  function loop(sqls, i, dump) {
    console.log(i)    
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
      .map(x => "SELECT '" + x.name + "' as name, COUNT(*) as rows, '" + x.sql + "' as schema from " + x.name + " UNION ")
      .reduce((x, y) => x + y)
    sql = sql.substr(0, sql.length - 6)
    db.all(sql, (err, tableInfos) => callback({ tables: tableInfos }))
  }) 
}

function executeSql(sql, callback) {
  console.log("executing sql", sql)
  if (!sql) return callback({ error: "no sql was given to execute" })
  sql = sql.trim()

  if (sql.toLowerCase().startsWith("select ")) {
     db.all(sql, (err, rows) => {
       console.log("error", err)
       callback({ result: rows, error: err ? err.stack : undefined })
     })
  } else {
    db.serialize(() => db.run(sql, err => { 
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
