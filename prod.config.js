module.exports = {
    apps : [
      {
        name: "app",
        script: "server.js",
        env: {
          NODE_ENV: "production",
          LOG_TYPE: 'STDOUT'
        },
        output: '/dev/null',
        error: '/dev/null',
      },
      {
        name: "health-check",
        script: "health-check.js",
        output: '/dev/null',
        error: '/dev/null',
      }
    ]
}
