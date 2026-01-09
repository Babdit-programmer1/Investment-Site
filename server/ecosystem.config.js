module.exports = {
  apps: [{
    name: "prestige-server",
    script: "./dist/index.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '800M', // Strict limit for t2.micro/t3.micro
    env: {
      NODE_ENV: "production",
      PORT: 3001
    }
  }]
};