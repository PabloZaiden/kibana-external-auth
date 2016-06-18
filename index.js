const requestApi = require('request');

const authServerUrl = process.env.AUTH_SERVER_URL;

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

        var cookies = parseCookie(request.headers != undefined ? request.headers.cookie : '');
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

function parseCookie(str, options) {
  if (str == undefined) {
      str = '';
  }
  
  var pairSplitRegExp = /; */;
  var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {}
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim()
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

var decode = decodeURIComponent;

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}


