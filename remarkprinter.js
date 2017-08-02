// Requires chrome-launcher, sleep-promise, minimist, and chrome-remote-interface

const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
var argv = require('minimist')(process.argv.slice(2));

if (!("filename" in argv)) {
    showUsage("You must add the filename with --filename.");
}

if (!("ratio" in argv)) {
    showUsage("You must add the ratio with --ratio.");
}

if (!("url" in argv)) {
    showUsage("You must add the url with --url.");
}

function showUsage(missingParam) {
    console.log(missingParam)
    console.log("Usage: --filename pathtooutput --ratio [16x9|4x3] --url pageurl")
    process.exit()
}

console.log("Writing to " + argv["filename"] + " from page " + argv["url"])

function launchChrome(headless=true) {
  return chromeLauncher.launch({
    chromeFlags: [
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
        await Page.navigate({url: argv["url"]});
        await Page.loadEventFired();

        // TODO: Change from hard coded sleep to wait on a completion event
        console.log("Sleeping")
        var sleep = require('sleep-promise');
        await sleep(5000);

        console.log("Printing")

        printOptions = {
            printBackground: true,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0
        }

        if (argv["ratio"] == "16x9") {
            printOptions["paperWidth"] = 12.6
            printOptions["paperHeight"] = 7.1
        } else if (argv["ratio"] == "4x3") {
            printOptions["paperWidth"] = 9.46
            printOptions["paperHeight"] = 7.1
        } else {
            throw new Error("Unsupported ratio \"" + argv["ratio"] + "\"")
        }

        // TODO: Add option for printing specific pages using pageRanges

        const {data} = await Page.printToPDF(printOptions);

        console.log("Writing")

        var fs = require('fs');
        fs.writeFileSync(argv["filename"], Buffer.from(data, 'base64'));

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
