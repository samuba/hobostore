function execSql(sql, params) {
    console.log("executing SQL: \n" + sql + "\nWith params: ", params)
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

window.onload = function () {
  const apiKeyInput = document.getElementById("api-key-input")
  apiKeyInput.value = getApiKey()
  apiKeyInput.addEventListener('keyup', e => setApiKey(apiKeyInput.value))
}