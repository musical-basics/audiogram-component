const puppeteer = require('puppeteer');
const { launch, getStream } = require('puppeteer-stream');
const fs = require('fs');

async function exportVideo() {
    console.log('Starting 1080p video export...');

    // Launch browser with specific 1080p window size
    const browser = await launch({
        executablePath: puppeteer.executablePath(),
        headless: false,
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
        args: [
            '--window-size=1920,1080',
            '--autoplay-policy=no-user-gesture-required'
        ]
    });

    const page = await browser.newPage();

    // Navigate to local dev server
    await page.goto('http://localhost:3000', {
        waitUntil: 'networkidle0'
    });

    // Start recording stream
    const file = fs.createWriteStream('audiogram-1080p.webm');
    const stream = await getStream(page, { audio: true, video: true });
    stream.pipe(file);

    console.log('Recording started...');

    // Click Play button
    // We look for the button with the Play icon (which has an aria-label "Play")
    await page.waitForSelector('button[aria-label="Play"]');
    await page.click('button[aria-label="Play"]');

    // Wait for audio duration (approx 20s + buffer)
    // The audio is 20s long per the adjusted captions, let's wait 21s
    await new Promise(resolve => setTimeout(resolve, 21000));

    console.log('Recording finished. Saving file...');

    await stream.destroy();
    file.end();
    await browser.close();

    console.log('Export complete: audiogram-1080p.webm');
}

exportVideo().catch(console.error);
