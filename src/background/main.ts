import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'

/* global sia, Go */
import '~/sia/wasm_exec.js';
import Sia from '~/sia/sia.wasm?url';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})

// Originally was in sia/sia.worker.js
if (!WebAssembly.instantiateStreaming) { // polyfill
  WebAssembly.instantiateStreaming = async(resp, importObject) => {
    const source = await (await resp).arrayBuffer();
    return await WebAssembly.instantiate(source, importObject);
  };
}

async function loadWASM() {
  const go = new Go(),
      result = await WebAssembly.instantiateStreaming(fetch(Sia), go.importObject);

  go.run(result.instance).catch(ex => console.error('go program exited', ex));

  await new Promise(resolve => setTimeout(resolve, 1));
}

async function load() {
  try {
    await loadWASM();
    // postMessage('ready');
    await sendMessage(
        "spawn-worker-response",
        "ready",
        "popup"
    );

  } catch (ex) {
    // postMessage([ex.message]);
    await sendMessage(
        "spawn-worker-response",
        [ex.message],
        "popup"
    );
    console.error('load', ex);
  }
}

const loaded = load();

onMessage('spawn-worker', async (message) => {
  const { data, sender } = message;

  console.log('spawn-worker', data, 'sender', sender);

  try {
    if (!Array.isArray(data) || data.length === 0)
      return;

    const action = data[0];

    let params = [];

    if (data.length > 1)
      params = data.slice(1);

    await loaded;

    if (typeof sia[action] !== 'function') {
      // postMessage([`${action} not found`]);
      await sendMessage(
          "spawn-worker-response",
          [`${action} not found`],
          "popup"
      );
      console.error(`${action} not found`);
      return;
    }

    params.push(async (err, value) => {
      // postMessage([err, value]);
      await sendMessage(
          "spawn-worker-response",
          [err, value],
          "popup"
      );
      console.log(err, value)
    });

    const error = global.sia[action].apply(this, params);

    if (typeof error === 'string') {
      //   postMessage([`${action}: ${error}`]);
      await sendMessage(
          "spawn-worker-response",
          [`${action}: ${error}`],
          "popup"
      );
      console.error(`${action}: ${error}`);
    }
  } catch (ex) {
    // postMessage([ex.message]);
    await sendMessage(
        "spawn-worker-response",
        [ex.message],
        "popup"
    );
    console.error('onHandleAction', ex);
  }
})

