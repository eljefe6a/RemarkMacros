// Requires chrome-launcher, sleep-promise, and chrome-remote-interface

const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');

// Optional: set logging level of launcher to see its output.
// Install it using: yarn add lighthouse-logger
// const log = require('lighthouse-logger');
// log.setLevel('info');

/**
 * Launches a debugging instance of Chrome.
 * @param {boolean=} headless True (default) launches Chrome in headless mode.
 *     False launches a full version of Chrome.
 * @return {Promise<ChromeLauncher>}
 */
function launchChrome(headless=true) {
  return chromeLauncher.launch({
    // port: 9222, // Uncomment to force a specific port of your choice.
    chromeFlags: [
      '--window-size=897,673',
      '--disable-gpu',
      headless ? '--headless' : ''
    ]
  });
}

launchChrome().then(async chrome => {
    const protocol = await CDP({port: chrome.port});

    // Extract the DevTools protocol domains we need and enable them.
    // See API docs: https://chromedevtools.github.io/devtools-protocol/
    const {Page} = protocol;
    await Page.enable();
    try {
        await Page.enable();
        await Page.navigate({url: 'http://localhost:8020/mobile/index.html'});
        await Page.loadEventFired();

        console.log("Sleeping")
        var sleep = require('sleep-promise');
        await sleep(10000);

        console.log("Printing")

        const {data} = await Page.printToPDF({
            printBackground: true,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0
        });

        console.log("Writing")

        var fs = require('fs');
        fs.writeFileSync('Couchbase_Mobile_Slides_CD257_chrome.pdf', Buffer.from(data, 'base64'));

        console.log("Done writing")
        chrome.kill();
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        protocol.close();
        chrome.kill();
    }
});
