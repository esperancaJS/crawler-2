let fs = require('fs-extra');

module.exports.cleanTmpBrowserData = async (browser) => {
    // https://github.com/GoogleChrome/puppeteer/issues/1791#issuecomment-367715074
    // find chrome user data dir (puppeteer_dev_profile-XXXXX) to delete it after it had been used
    let chromeTmpDataDir = null;
    let chromeSpawnArgs = browser.process().spawnargs;
    for (let i = 0; i < chromeSpawnArgs.length; i++) {
        if (chromeSpawnArgs[i].indexOf("--user-data-dir=") === 0) {
            chromeTmpDataDir = chromeSpawnArgs[i].replace("--user-data-dir=", "");
        }
    }

    await browser.close();

    if (chromeTmpDataDir !== null) {
        fs.removeSync(chromeTmpDataDir);
    }

    const exec = require('child_process').exec;

    exec('rm -r /tmp/core.* || true', function(err,stdout,stderr){     
        if(err)
            console.log('Directory Empty', err);
        else
            console.log("Files Deleted");
    });

    return chromeTmpDataDir;
}