// unlighthouse.config.ts
export default {
  scanner: {
    samples: 3,
    maxRoutes: 15,
    device: 'desktop',
    customCmdFlags: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ]
  },
  puppeteerOptions: {
    headless: true,
  }
}
