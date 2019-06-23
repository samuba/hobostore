Hobostore
================
An ultra cheap, SQL powered, Firebase alternative 

![hobostore logo](https://cdn.glitch.com/e003989b-8256-4c47-9d72-378acc6c5df4%2Fhobostore_small.png?v=1561301490961)


### Endpoints:
- **GET [/exec/](./exec)** will execute the SQL query that was passed as path parameter and return the result
- **PUT [/exec](./exec)** will execute the SQL query that was passed as `text/plain` body and return the result
- **POST [/exec](./exec)** takes an `application/json` object with `sql` and `params` properties, executes the SQL query with the given params and returns the result
- **GET [/info](./info)** returns information on the DB
- **GET [/dump](./dump)** dumps all the Tables

### Example
<code>
curl -X PUT --data "SELECT * FROM Authors" -H "Content-Type: text/plain" https://<myHobostoreUrl>/exec

{
  "result": [
    {
      "firstname": "Heinz",
      "lastname": "Erhardt",
      "description": "Wer sich selbst auf den Arm nimmt, erspart anderen die Arbeit."
    }
  ]
}
</code>