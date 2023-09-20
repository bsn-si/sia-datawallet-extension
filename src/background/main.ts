import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'

/* global sia, Go */
import '~/sia/wasm_exec.js';
import Sia from '~/sia/sia.wasm?url';
import _sodium from 'libsodium-wrappers-sumo';
import {encoder, decoder, sigCodes, FILE_URL} from './config.js';
import {decodeUrlSafeBase64ToArrayBuffer} from "~/utils/base64";
import {isFetchError} from "~/services";

let sodium: any, fileName: string, streamController, theKey, state, header, salt, encRx, encTx, decRx, decTx;

(async () => {
  await _sodium.ready;
  sodium = _sodium;
  console.log('sodium', sodium);
})();

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

// TODO: localStorage doesn't work in web workers. See https://developer.chrome.com/docs/extensions/reference/storage/#examples
// let autoLockTimeout = null;
// let walletSettings = JSON.parse(localStorage.getItem('walletSettings') as string)
//
// const resetAutoLock = async () => {
//   console.log('resetAutoLock')
//   let lockms = walletSettings.autoLock * 60000;
//
//   if (lockms <= 0)
//     lockms = 60000;
//
//   clearTimeout(autoLockTimeout);
//
//   autoLockTimeout = setTimeout(async () => {
//     localStorage.removeItem('walletSettings')
//   }, lockms);
// }

onMessage('reset-autolock', async () => {
  // await resetAutoLock();
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
        'spawn-worker-response',
        'ready',
        'popup'
    );

  } catch (ex) {
    // postMessage([ex.message]);
    await sendMessage(
        'spawn-worker-response',
        [ex.message],
        'popup'
    );
    console.error('load', ex);
  }
}

const loaded = load();

// See https://github.com/zikaari/webext-bridge
onMessage('spawn-worker', async (message) => {
  const { data, sender } = message;

  // console.log('spawn-worker', data, 'sender', sender);

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
          'spawn-worker-response',
          [`${action} not found`],
          'popup'
      );
      return;
    }

    const p = new Promise((resolve, reject) => {
      const f = async (err, value) => {
        // postMessage([err, value]);
        // console.log(err, value)
        // See sia/index.js, onMessage('spawn-worker-response')
        const r: {err: string, value: any} = await sendMessage(
            'spawn-worker-response',
            [err, value],
            'popup'
        )
        if (r && r.err)
            reject(new Error(r.err));
        else if (r && r.value)
            resolve(r.value);
        else
            resolve('');
      }

      params.push(f);
    });


    const error = global.sia[action].apply(this, params);

    if (typeof error === 'string') {
      //   postMessage([`${action}: ${error}`]);
      await sendMessage(
          'spawn-worker-response',
          [`${action}: ${error}`],
          'popup'
      );
    }

    return p;

  } catch (ex) {
    // postMessage([ex.message]);
    await sendMessage(
        'spawn-worker-response',
        [ex.message],
        'popup'
    );
    console.error('onHandleAction', ex);
  }
})

// See https://github.com/sh-dv/hat.sh/blob/master/service-worker/sw.js
// Counterpart is in src/components/modals/ModalUpload.vue
onMessage('hat-sh', async (message) => {
  const { data, sender } = message;

  try {
    if (!Array.isArray(data) || data.length === 0)
      return;

    const action = data[0];

    let params = [];

    if (data.length > 1)
      params = data.slice(1);


    switch (action) {
      case "prepareFileNameEnc":
        assignFileNameEnc(params[0]);
        break;

      case "prepareFileNameDec":
        params.length === 1 ? assignFileNameDec(params[0]) : assignFileNameDec(params[0], params[1]);
        break;

      case "requestEncryption":
        encKeyGenerator(params[0]);
        break;

      case "requestEncKeyPair":
        encKeyPair(params[0]/*e.data.privateKey*/, params[1]/*e.data.publicKey*/, params[2]/*e.data.mode*/);
        break;

      case "asymmetricEncryptFirstChunk":
        asymmetricEncryptFirstChunk(params[0]/*e.data.chunk*/, params[1]/*e.data.last*/, params[2]/*fileId*/);
        break;

      case "encryptFirstChunk":
        encryptFirstChunk(params[0]/*e.data.chunk*/, params[1]/*e.data.last*/, params[2]/*fileId*/);
        break;

      case "encryptRestOfChunks":
        encryptRestOfChunks(params[0]/*e.data.chunk*/, params[1]/*e.data.last*/, params[2]/*fileId*/);
        break;

      case "checkFile":
        params.length === 2 ? checkFile(params[0]/*e.data.signature*/, params[1]/*e.data.legacy*/)
            : checkFile(params[0]/*e.data.signature*/, params[1]/*e.data.legacy*/, params[2/*responseSuffix*/]);
        break;

      case "requestTestDecryption":
        testDecryption(
            params[0]/*e.data.password*/,
            params[1]/*e.data.signature*/,
            params[2]/*e.data.salt*/,
            params[3]/*e.data.header*/,
            params[4]/*e.data.decFileBuff*/
        );
        break;

      case "requestDecKeyPair":
        requestDecKeyPair(
            params[0]/*e.data.privateKey*/,
            params[1]/*e.data.publicKey*/,
            params[2]/*e.data.header*/,
            params[3]/*e.data.decFileBuff*/,
            params[4]/*e.data.mode*/
        );
        break;

      case "requestDecryption":
        decKeyGenerator(
           params[0]/*e.data.password*/,
           params[1]/*e.data.signature*/,
           params[2]/*e.data.salt*/,
           params[3]/*e.data.header*/
        );
        break;

      case "decryptFirstChunk":
        decryptChunks(params[0]/*e.data.chunk*/, params[1]/*e.data.last*/);
        break;

      case "decryptRestOfChunks":
        decryptChunks(params[0]/*e.data.chunk*/, params[1]/*e.data.last*/);
        break;

      case "pingSW":
        // console.log("SW running");
        break;

      case "doStreamFetch":
        doStreamFetch(params[0]/*url*/, params[1]/*token*/, params[2]/*fileId*/)
        break;
    }
  } catch (ex) {

  }
})

const doStreamFetch = async (url, token, fileId) => {
  const stream = new ReadableStream({
    start(controller) {
      console.log('Start stream controller fileId', fileId)
      streamController = controller;
    },
  });

  // const supportsRequestStreams = (() => {
  //   let duplexAccessed = false;
  //
  //   const hasContentType = new Request('', {
  //     body: new ReadableStream(),
  //     method: 'POST',
  //     get duplex() {
  //       duplexAccessed = true;
  //       return 'half';
  //     },
  //   }).headers.has('Content-Type');
  //
  //   return duplexAccessed && !hasContentType;
  // })();

  // console.log('supportsRequestStreams', supportsRequestStreams)


  // Test
  // const reader = stream.getReader();
  // while (true) {
  //   const {value, done} = await reader.read();
  //   if (done) break;
  //   console.log('Received', value);
  // }

  // See https://developer.chrome.com/articles/fetch-streaming-requests/
  // Test on https://httpbin.org/put

    console.log('doStreamFetch', url)

  try {
    const r = await fetch(url, {
    method: 'PUT',
    duplex: 'half',
    body: stream,
    headers: {
      'Authorization': `Basic ${token}`
      },
    })
    console.log('doStreamFetch response', r)
    console.log('Finished uploading fileId', fileId)
    await sendMessage(
        'hat-sh-response',
        ['uploadingFinished', fileId],
        'popup'
    );
  } catch (e) {
    console.error(e)
    if (isFetchError(e)) {
      const status = (e as Response).status
      const statusText = (e as Response).statusText
      if (status === 500) {
        console.error('500 error. ' + statusText, e.data)
      }
    }
  }
}

// Fetch request handler to download decrypted file: chrome-extension://XXX/dist/popup/file
self.addEventListener("fetch", (e) => {
  // console.log(e); // log fetch event
  if (e.request.url.startsWith(FILE_URL)) {
    const stream = new ReadableStream({
      start(controller) {
        streamController = controller;
      },
    });
    const response = new Response(stream);
    response.headers.append(
        "Content-Disposition",
        'attachment; filename="' + fileName + '"'
    );
    e.respondWith(response);
  }
});


const assignFileNameEnc = async (name) => {
  fileName = name;

  console.log('assignFileNameEnc')
  await sendMessage(
      'hat-sh-response',
      ['filePreparedEnc'],
      'popup'
  );
}

const assignFileNameDec = async (name, responseSuffix = '') => {
  fileName = name;

  await sendMessage(
      'hat-sh-response' + responseSuffix,
      ['filePreparedDec'],
      'popup'
  );
}

let encKeyGenerator = (password) => {
  sodium.ready.then(async () => {
    salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

    theKey = sodium.crypto_pwhash(
        sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES,
        password,
        salt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    let res = sodium.crypto_secretstream_xchacha20poly1305_init_push(theKey);
    state = res.state;
    header = res.header;

    await sendMessage(
        'hat-sh-response',
        ['keysGenerated'],
        'popup'
    );
  });
};

const encKeyPair = async (csk, spk, mode) => {
  try {
    if (csk === spk) {

      await sendMessage(
          'hat-sh-response',
          ['wrongKeyPair'],
          'popup'
      );
      return;
    }

    let computed = sodium.crypto_scalarmult_base(sodium.from_base64(csk));
    computed = sodium.to_base64(computed);
    if (spk === computed) {

      await sendMessage(
          'hat-sh-response',
          ['wrongKeyPair'],
          'popup'
      );
      return;
    }

    if (sodium.from_base64(csk).length !== sodium.crypto_kx_SECRETKEYBYTES) {

      await sendMessage(
          'hat-sh-response',
          ['wrongPrivateKey'],
          'popup'
      );
      return;
    }

    if (sodium.from_base64(spk).length !== sodium.crypto_kx_PUBLICKEYBYTES) {
      await sendMessage(
          'hat-sh-response',
          ['wrongPublicKey'],
          'popup'
      );
      return;
    }

    let key = sodium.crypto_kx_client_session_keys(
        sodium.crypto_scalarmult_base(sodium.from_base64(csk)),
        sodium.from_base64(csk),
        sodium.from_base64(spk)
    );

    if (key) {
      [encRx, encTx] = [key.sharedRx, key.sharedTx];

      if (mode === "test" && encRx && encTx) {
        await sendMessage(
            'hat-sh-response',
            ['goodKeyPair'],
            'popup'
        );
      }

      if (mode === "derive" && encRx && encTx) {
        let res =
            sodium.crypto_secretstream_xchacha20poly1305_init_push(encTx);
        state = res.state;
        header = res.header;
        await sendMessage(
            'hat-sh-response',
            ['keyPairReady'],
            'popup'
        );
      }
    } else {

      await sendMessage(
          'hat-sh-response',
          ['wrongKeyPair'],
          'popup'
      );
    }
  } catch (error) {

    await sendMessage(
        'hat-sh-response',
        ['wrongKeyInput'],
        'popup'
    );
  }
};

const asymmetricEncryptFirstChunk = async (chunk, last, fileId) => {
  setTimeout(async function () {
    if (!streamController) {
      console.log("stream does not exist");
    }
    const SIGNATURE = new Uint8Array(
        encoder.encode(sigCodes["v2_asymmetric"])
    );

    streamController.enqueue(SIGNATURE);
    streamController.enqueue(header);

    let tag = last
        ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
        : sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;

    let encryptedChunk = sodium.crypto_secretstream_xchacha20poly1305_push(
        state,
        decodeUrlSafeBase64ToArrayBuffer(chunk),
        null,
        tag
    );

    streamController.enqueue(new Uint8Array(encryptedChunk));

    if (last) {
      streamController.close();

      await sendMessage(
          'hat-sh-response',
          ['encryptionFinished', fileId],
          'popup'
      );
    }

    if (!last) {
      await sendMessage(
          'hat-sh-response',
          ['continueEncryption'],
          'popup'
      );
    }
  }, 500);
};

const encryptFirstChunk = async (chunk, last, fileId) => {
  if (!streamController) {
    console.log("stream does not exist");
  }
  const SIGNATURE = new Uint8Array(
      encoder.encode(sigCodes["v2_symmetric"])
  );

  streamController.enqueue(SIGNATURE);
  streamController.enqueue(salt);
  streamController.enqueue(header);

  let tag = last
      ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
      : sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;

  let encryptedChunk = sodium.crypto_secretstream_xchacha20poly1305_push(
      state,
      decodeUrlSafeBase64ToArrayBuffer(chunk),
      null,
      tag
  );

  streamController.enqueue(new Uint8Array(encryptedChunk));

  if (last) {
    streamController.close();

    await sendMessage(
        'hat-sh-response',
        ['encryptionFinished', fileId],
        'popup'
    );
  }

  if (!last) {

    await sendMessage(
        'hat-sh-response',
        ['continueEncryption'],
        'popup'
    );
  }
};

const encryptRestOfChunks = async (chunk, last, fileId) => {

  let tag = last
      ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
      : sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;

  let encryptedChunk = sodium.crypto_secretstream_xchacha20poly1305_push(
      state,
      decodeUrlSafeBase64ToArrayBuffer(chunk),
      null,
      tag
  );

  streamController.enqueue(encryptedChunk);

  if (last) {
    streamController.close();

    await sendMessage(
        'hat-sh-response',
        ['encryptionFinished', fileId],
        'popup'
    );
  }

  if (!last) {

    await sendMessage(
        'hat-sh-response',
        ['continueEncryption'],
        'popup'
    );
  }
};

const checkFile = async (signature, legacy, responseSuffix = '') => {
  signature = decodeUrlSafeBase64ToArrayBuffer(signature);
  legacy = decodeUrlSafeBase64ToArrayBuffer(legacy);

  if (decoder.decode(signature) === sigCodes["v2_symmetric"]) {

    await sendMessage(
        'hat-sh-response' + responseSuffix,
        ['secretKeyEncryption'],
        'popup'
    );
  } else if (
      decoder.decode(signature) === sigCodes["v2_asymmetric"]
  ) {

    await sendMessage(
        'hat-sh-response' + responseSuffix,
        ['publicKeyEncryption'],
        'popup'
    );
  } else if (decoder.decode(legacy) === sigCodes["v1"]) {

    await sendMessage(
        'hat-sh-response' + responseSuffix,
        ['oldVersion'],
        'popup'
    );
  } else {

    await sendMessage(
        'hat-sh-response' + responseSuffix,
        ['badFile'],
        'popup'
    );
  }
};

const requestDecKeyPair = async (ssk, cpk, header, decFileBuff, mode) => {
  try {
    if (ssk === cpk) {

      await sendMessage(
          'hat-sh-response-dec',
          ['wrongDecKeyPair'],
          'popup'
      );
      return;
    }

    let computed = sodium.crypto_scalarmult_base(sodium.from_base64(ssk));
    computed = sodium.to_base64(computed);
    if (cpk === computed) {

      await sendMessage(
          'hat-sh-response-dec',
          ['wrongDecKeyPair'],
          'popup'
      );
      return;
    }

    if (sodium.from_base64(ssk).length !== sodium.crypto_kx_SECRETKEYBYTES) {

      await sendMessage(
          'hat-sh-response-dec',
          ['wrongDecPrivateKey'],
          'popup'
      );
      return;
    }

    if (sodium.from_base64(cpk).length !== sodium.crypto_kx_PUBLICKEYBYTES) {

      await sendMessage(
          'hat-sh-response-dec',
          ['wrongDecPublicKey'],
          'popup'
      );
      return;
    }

    let key = sodium.crypto_kx_server_session_keys(
        sodium.crypto_scalarmult_base(sodium.from_base64(ssk)),
        sodium.from_base64(ssk),
        sodium.from_base64(cpk)
    );

    if (key) {
      [decRx, decTx] = [key.sharedRx, key.sharedTx];

      if (mode === "test" && decRx && decTx) {
        let state_in = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
            decodeUrlSafeBase64ToArrayBuffer(header),
            decRx
        );

        if (state_in) {
          let decTestresults =
              sodium.crypto_secretstream_xchacha20poly1305_pull(
                  state_in,
                  decodeUrlSafeBase64ToArrayBuffer(decFileBuff)
              );

          if (decTestresults) {

            await sendMessage(
                'hat-sh-response-dec',
                ['readyToDecrypt'],
                'popup'
            );
          } else {

            await sendMessage(
                'hat-sh-response-dec',
                ['wrongDecKeys'],
                'popup'
            );
          }
        }
      }

      if (mode === "derive" && decRx && decTx) {
        state = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
            decodeUrlSafeBase64ToArrayBuffer(header),
            decRx
        );

        if (state) {

          await sendMessage(
              'hat-sh-response-dec',
              ['decKeyPairGenerated'],
              'popup'
          );
        }
      }
    }
  } catch (error) {

    await sendMessage(
        'hat-sh-response-dec',
        ['wrongDecKeyInput'],
        'popup'
    );
  }
};

const decKeyGenerator = async (password, signature, salt, header) => {
  signature = decodeUrlSafeBase64ToArrayBuffer(signature);

  if (decoder.decode(signature) === sigCodes["v2_symmetric"]) {
    salt = decodeUrlSafeBase64ToArrayBuffer(salt);
    header = decodeUrlSafeBase64ToArrayBuffer(header);

    theKey = sodium.crypto_pwhash(
        sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES,
        password,
        salt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    state = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
        header,
        theKey
    );

    if (state) {

      await sendMessage(
          'hat-sh-response-dec',
          ['decKeysGenerated'],
          'popup'
      );
    }
  }
};
const decryptChunks = async (chunk, last) => {
  setTimeout(async function () {
    let result = sodium.crypto_secretstream_xchacha20poly1305_pull(
        state,
        decodeUrlSafeBase64ToArrayBuffer(chunk)
    );

    if (result) {
      let decryptedChunk = result.message;

      streamController.enqueue(new Uint8Array(decryptedChunk));

      if (last) {
        streamController.close();
        await sendMessage(
            'hat-sh-response-dec',
            ['decryptionFinished'],
            'popup'
        );
      }
      if (!last) {
        await sendMessage(
            'hat-sh-response-dec',
            ['continueDecryption'],
            'popup'
        );
      }
    } else {
      await sendMessage(
          'hat-sh-response-dec',
          ['wrongPassword'],
          'popup'
      );
    }
  }, 500);
};

const testDecryption = async (
    password,
    signature,
    salt,
    header,
    decFileBuff
) => {
  signature = decodeUrlSafeBase64ToArrayBuffer(signature);

  if (decoder.decode(signature) === sigCodes["v2_symmetric"]) {
    let decTestsalt = decodeUrlSafeBase64ToArrayBuffer(salt);
    let decTestheader = decodeUrlSafeBase64ToArrayBuffer(header);

    let decTestKey = sodium.crypto_pwhash(
        sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES,
        password,
        decTestsalt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    let state_in = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
        decTestheader,
        decTestKey
    );

    if (state_in) {
      let decTestresults = sodium.crypto_secretstream_xchacha20poly1305_pull(
          state_in,
          decodeUrlSafeBase64ToArrayBuffer(decFileBuff)
      );
      if (decTestresults) {
        await sendMessage(
            'hat-sh-response-dec',
            ['readyToDecrypt'],
            'popup'
        );
      } else {
        await sendMessage(
            'hat-sh-response-dec',
            ['wrongPassword'],
            'popup'
        );
      }
    }
  }
};
