# kibana-external-auth
Kibana plugin for external authentication

## How to use
- To start authenticating all the request set to the kibana server, this plugin uses the `AUTH_SERVER_URL` environment variable and the `authToken` cookie. 
- When a resource is requested, it will send a request to `[AUTH_SERVER_URL]?token=[authToken cookie value]`.
- If the server returns `200 OK`, it will allow the execution of the request. Otherwise, it will return a `401 Unauthorized`.

It is **strongly suggested** (but not enforced) that the kibana server should be exposed only through HTTPS. 
