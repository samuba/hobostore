function execSql(sql) {
  console.log("executing SQL: \n" + sql)
    return new Promise((resolve, reject) => {
        axios.post("../api/execute", 
                   { sql: sql.trim() }, 
                   { headers: { "api-key": getApiKey() }})
            .then(x => {
                if (!x.data.error) return resolve(x.data.result)

                console.error("Could not execute SQL: \n" + sql + "\n\n", x.data.error)
                reject(x.data.error)
            })
            .catch(err => { 
              if(err.response && err.response.data) reject(err.response.data)
              else reject(err)
            })
    })
}

function runSql(sql, params) {
  console.log("running SQL: \n" + sql + "\nwith params: \n" + params)
  return new Promise((resolve, reject) => {
      axios.post("../api/exec", 
                 { sql: sql.trim(), params }, 
                 { headers: { "api-key": getApiKey() }})
          .then(x => {
              if (!x.data.error) return resolve(x.data.result)

              console.error("Could not execute SQL: \n" + sql + "\n\n", x.data.error)
              reject(x.data.error)
          })
          .catch(err => { 
            if(err.response && err.response.data) reject(err.response.data)
            else reject(err)
          })
  })
}

function getDBInfo() {
  return new Promise((resolve, reject) => {
    axios.get("../api/info", { headers: { "api-key": getApiKey() }})
      .then(x => {
          if (!x.data.error) return resolve(x.data)
          reject(x.data.error)
      })
      .catch(err => { 
        if(err.response && err.response.data) reject(err.response.data)
        else reject(err)
      })
    })
}

function setApiKey(key) { localStorage.setItem("api-key", key) }
function getApiKey() { return localStorage.getItem("api-key") }

function getLastSql() { return localStorage.getItem("last-sql") }
function setLastSql(sql) { localStorage.setItem("last-sql", sql) }

window.onload = function () {
  const apiKeyInput = document.getElementById("api-key-input")
  apiKeyInput.value = getApiKey()
  apiKeyInput.addEventListener('keyup', e => setApiKey(apiKeyInput.value))
}