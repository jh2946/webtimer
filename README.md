# webtimer

chrome/firefox extension
track how much time you spend on websites

## Build instructions (testers)

Run the following in your work directory:
```
git clone https://github.com/jh2946/webtimer.git
cd webtimer
npm install
```

In `./src/settings.json` change the value of "browser" to "chrome" or "firefox", whichever browser you're using. Then run:
```
npm run build
```

### For Chrome

* Click puzzle icon on the top right of the browser window
* "Manage Extensions"
* On the top left of the window, "Load unpacked"
* Navigate to the webtimer directory and select `./chrome/` (not `./src/chrome/`!)
* Optional: incognito tracking is disabled by default. To enable, click "Details" under webtimer and toggle "Allow in Incognito" to true.

### For Firefox

* Run in the webtimer directory:
```
npm run firefox
```
* Install [Firefox Browser Developer Edition](https://www.mozilla.org/en-US/firefox/developer/) and open
* Go to address "about:config"
* Search preference name "xpinstall.signatures.required" and toggle to false
* Go to address "about:addons"
* Click on the cogwheel beside "Manage Your Extensions" and "Install Add-on From File..."
* Navigate to the webtimer directory and select `./firefox.zip`
* Optional: private window tracking is disabled by default. To enable, click on webtimer on the "about:addons" page and toggle "Run in Private Windows" to "Allow".
