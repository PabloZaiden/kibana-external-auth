export default function (server) {

  server.route({
    path: '/api/auth_plugin/example',
    method: 'GET',
    handler(req, reply) {
      reply({ time: (new Date()).toISOString() });
    }
  });

};
