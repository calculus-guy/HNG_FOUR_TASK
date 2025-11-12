@Get('health')
health() {
  return { success: true, uptime: process.uptime(), timestamp: Date.now() };
}