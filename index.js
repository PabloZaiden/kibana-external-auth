const cookieApi = require('cookie');
const conf = require('nconf').env();
const requestApi = require('request');

const authServerUrl = conf.get('AUTH_SERVER_URL');

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    uiExports: {
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) {
      if (authServerUrl == undefined) {
        console.log("Couldn't get AUTH_SERVER_URL info");
        return;
      }

      //Define the cookie
      server.state('authToken', {
        encoding: 'none',
      });

      server.ext('onPreResponse', function (request, reply) {
        if (request.query.setAuthToken) {
          var authToken = request.query.setAuthToken;
          reply
            .redirect('/')
            .state('authToken', authToken);
          return;
        }

        let cookies = cookieApi.parse(request.headers.cookie);
        if (cookies.authToken != undefined) {
          requestApi(authServerUrl + '?token=' + cookies.authToken, function (err, response, body) {
            if (response.statusCode >= 200 && response.statusCode < 300) {
              reply.continue();
            } else {
              reply('Unauthorized').code(401)
            }
          });
        } else {
          reply('Unauthorized').code(401);
        }
      });
    }
  });
}

