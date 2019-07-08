Hobostore
================
An ultra cheap, SQL powered, Firestore alternative. With it you can execute arbitrary SQL queries via HTTP. e.g. `curl -X PUT --data "SELECT * FROM Authors" -H "Content-Type: text/plain" `

So it is Basically just a thin HTTP wrapper around SQLite. 
Do not use this for anything important! There is currently nothing in place for the security and safety of your data.

![hobostore logo](https://cdn.glitch.com/e003989b-8256-4c47-9d72-378acc6c5df4%2Fhobostore-no-bg-small.png)

## HowTo
Recommended use is to just fork/remix it on [glitch.com](https://glitch.com/~hobostore) to get your own hosted instance for free immediately.

### Explore it via UI: [Hobostore Explorer](./explore)

### Endpoints:
- **GET [/api/exec/](./api/exec)** will execute the SQL query that was passed as path parameter and return the result
- **PUT [/api/exec](./api/exec)** will execute the SQL query that was passed as `text/plain` body and return the result
- **POST [/api/exec](./api/exec)** takes an `application/json` object with `sql` (prepared statement) and `params` properties, executes the SQL query with the given params and returns the result
- **GET [/api/info](./api/info)** returns information on the DB
- **GET [/api/dump](./api/dump)** dumps all the Tables

### Example
<code>
curl -X PUT --data "SELECT * FROM Authors" -H "Content-Type: text/plain" https://%myHobostoreUrl%/exec

{
  "result": [
    {
      "firstname": "Heinz",
      "lastname": "Erhardt"
    }
  ]
}
</code>