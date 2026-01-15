module.exports = {
  apps: [{
    name: "prestige-server",
    script: "./dist/index.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '800M',
    env: {
      NODE_ENV: "production",
      PORT: 3001
    }
  }]
};