Hobostore
================
An ultra cheap, SQL powered, Firestore alternative. With it you can execute arbitrary SQL queries via HTTP and get the result as JSON.
It is Basically just a thin HTTP wrapper around SQLite. 

Do not use this for anything important as it is heavy work in progress and will probably never be mature enough for bigger projects.

![hobostore logo](https://cdn.glitch.com/e003989b-8256-4c47-9d72-378acc6c5df4%2Fhobostore-no-bg-small.png)

### We even have a half assed UI: [Hobostore Explorer](./explore)

### Example
<pre>
curl -X PUT --data "SELECT * FROM Authors" -H "Content-Type: text/plain" https://%myHobostoreUrl%/exec

{
  "result": [
    {
      "firstname": "Heinz",
      "lastname": "Erhardt"
    }
  ] 
}
</pre>

## HowTo
Recommended use is to just fork/remix it on [glitch.com](https://glitch.com/~hobostore) to get your own hosted instance for free immediately.

### Security
All endpoints under `/api` are guarded via an api key that you can pass in the headers of your request or as query parameter like this: `api/download-db?api-key=123`.
On server side you can set it by specifying the `API_KEY` environment variable. Or if you are hosting it on glitch set it in the `.env` file

### Endpoints:
- **GET [/api/exec/](./api/exec)** will execute the SQL query that was passed as path parameter and return the result
- **PUT [/api/exec](./api/exec)** will execute the SQL query that was passed as `text/plain` body and return the result
- **POST [/api/exec](./api/exec)** takes an `application/json` object with `sql` (prepared statement) and `params` properties, executes the SQL query with the given params and returns the result
- **GET [/api/info](./api/info)** returns information on the DB
- **GET [/api/dump](./api/dump)** dumps all the Tables
- **GET [/api/download-db](./api/download-db)** let's you download the sqlite file