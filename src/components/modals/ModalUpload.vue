<template>
  <v-f-modal-layout>
    <div class="sm:flex sm:items-start">
      <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 dark:bg-gray-500 sm:mx-0 sm:h-10 sm:w-10">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-blue-600 dark:stroke-blue-100" fill="none" viewBox="0 0 24 24" stroke="none" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
      </div>
      <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-400" id="modal-title">{{ t('Upload files') }}</h3>
        <div class="mt-2">
          <div class="text-gray-500 mb-1 py-2">
            <div v-for="file in queue">
              <div :id="file.id"> {{ file.name }} ( {{ file.size }}) <b>{{ humanFileStatus(file.status) }}</b></div>
            </div>

            <div class="py-2" v-if="!queue.length">{{ t('No files selected!') }}</div>
          </div>
          <div class="text-gray-500" ref="container">
              <button ref="pickFiles"  type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                {{ t('Select Files') }}</button>
          </div>
          <message v-if="message.length" @hidden="message=''" error>{{ message }}</message>
        </div>
      </div>
    </div>

    <template v-slot:buttons>
      <button :disabled="disableUploadButton" @click.prevent="handleUpload" type="button"
              :class="disableUploadButton ? 'bg-blue-200 hover:bg-blue-200 dark:bg-gray-700/50 dark:hover:bg-gray-700/50 dark:text-gray-500' : 'bg-blue-600 hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-500'"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
        <span v-if="!isDownloading">{{ t('Upload') }}</span>
        <div v-else role="status">
          <svg aria-hidden="true" class="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      </button>
      <button type="button" @click="emitter.emit('vf-modal-close')" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">{{ 'Close' }}</button>
    </template>
  </v-f-modal-layout>
</template>

<script>
export default {
  name: 'VFModalUpload'
};
</script>


<script setup>
import plupload from 'plupload'
import VFModalLayout from './ModalLayout.vue';
import {inject, onMounted, ref} from 'vue';
import {useApiUrl} from '../../composables/useApiUrl.js';
import {CONFIG} from "~/env";
import {userStorage, useUserStore} from "~/store/user";
import getCurrentDir from "~/utils/getCurrentDir";
import {storeToRefs} from "pinia";
import { onMessage, sendMessage } from "webext-bridge/popup";
import {CHUNK_SIZE} from "~/hat-sh-config/constants";
import {encodeArrayBufferToUrlSafeBase64} from "~/utils/base64";
import {subscriptionUsageEvent} from "~/services/backend";

const { user } = storeToRefs(useUserStore())
const emitter = inject('emitter');
const {apiUrl} = useApiUrl();
const {t} = inject('i18n');
const maxFileSize = inject('maxFileSize');

const props = defineProps({
  current: Object,
  currentWalletId: String
});

const uploader = ref(null);
const container = ref(null);
const pickFiles = ref(null);
const queue = ref([]);
const message = ref('');

const files = ref([]);
const currFile = ref(0);
const isDownloading = ref(false);
let file,
    password,
    index,
    numberOfFiles,
    encryptionMethodState = "secretKey",
    privateKey,
    publicKey;

const disableUploadButton = ref(true);

const handleUpload = () => {
  message.value = '';
  //TODO: remove plupload which was needed for uploading files without encryption
  // uploader.value.start();
  handleEncryptedFilesDownload();
};

const postData = inject('postData');

onMounted(() => {
  uploader.value = new plupload.Uploader({
    runtimes: 'html5',
    browse_button: pickFiles.value,
    container: container.value,
    max_file_size: maxFileSize,
    multiple_queues: true,
    file_data_name: 'file',
    http_method: 'PUT',
    url: `${CONFIG.API_HOST}/api/objects/`,//apiUrl.value + '?' + buildURLQuery(Object.assign(postData, {q: 'upload', adapter: props.current.adapter, path: props.current.dirname})),
    // filters : [
    // 	{title : "Image files", extensions : "jpg,gif,png,jpeg"},
    // 	{title : "Zip files", extensions : "zip"}
    // ],
    headers: {
      // ...(csrf && {'X-CSRF-Token' : csrf})
      ...{'Authorization': `Basic ${userStorage.get()?.token}`}
    },

    init: {
      PostInit: function () {
      },

      FilesAdded: function (up, selectedFiles) {
        disableUploadButton.value = false;
        plupload.each(selectedFiles, function (file) {
          queue.value.push({
            id: file.id,
            name: file.name,
            size: plupload.formatSize(file.size),
            status: '',
          });
        });

        selectedFiles = Array.from(selectedFiles);
        if (files.value.length > 0) {
          files.value = files.concat(selectedFiles);
          files.value = files.value.filter(
              (thing, index, self) =>
                  index ===
                  self.findIndex((t) => t.name === thing.name && t.size === thing.size)
          );
        } else {
          files.value = selectedFiles;
        }
      },

      BeforeUpload: function (up, file) {
        const currentDir = getCurrentDir(props.currentWalletId, props.current.dirname);
        up.setOption('url', `${CONFIG.API_HOST}/api/objects/` + props.currentWalletId + '?pathType=file' + '&path=' + currentDir + encodeURIComponent(file.name));
      },

      UploadProgress: function (up, file) {
        queue.value[queue.value.findIndex((item) => item.id == file.id)].percent = file.percent + '%';
      },

      UploadComplete: function () {
        disableUploadButton.value = true;
        emitter.emit('vf-fetch', {params:{q: 'index', adapter: props.current.adapter, path: props.current.dirname}});
      },

      Error: function (up, err) {

        uploader.value.stop();
        if (err.code == plupload.HTTP_ERROR) {
          message.value = t(JSON.parse(err.response).message);
        } else if (err.code == plupload.FILE_SIZE_ERROR) {
          message.value = t('The selected file exceeds the maximum file size. You cannot upload files greater than %s', [maxFileSize]);
        } else {
          message.value = t(err.message);
        }
      }
    }
  });

  uploader.value.init();
});

// See https://github.com/sh-dv/hat.sh/blob/master/src/components/EncryptionPanel.js
onMessage('hat-sh-response', async (message) => {
  const {data, sender} = message;

  if (!Array.isArray(data)) {
    console.error('unexpected data', data);
  }

  const action = data[0];

  let params = [];

  if (data.length > 1)
    params = data.slice(1);

  switch (action) {
    case 'keysGenerated':
      startEncryption("secretKey");
      break;

    case "keyPairReady":
      startEncryption("publicKey");
      break;

    case "filePreparedEnc":
      console.log("filePreparedEnc")
      kickOffEncryption();
      break;

    case "continueEncryption":
      continueEncryption();
      break;

    case "encryptionFinished":
      queue.value[queue.value.findIndex((item) => item.id === params[0])].status = 'encrypted';
      if (numberOfFiles > 1) {
        updateCurrFile();
        file = null;
        index = null;
        if (currFile.value <= numberOfFiles - 1) {
          setTimeout(function () {
            prepareFile();
          }, 1000);
        } else {
          // isDownloading.value = false;
          // handleNext();
        }
      } else {
        // isDownloading.value = false;
        // handleNext();
      }
      break;
    case "uploadingFinished":
      const idx = queue.value.findIndex((item) => item.id === params[0]);
      if (idx !== -1) {
        queue.value[idx].status = 'uploaded';

        let totalUploaded = queue.value.reduce((count, item) => {
          if (item.status === 'uploaded') {
            return count + 1;
          }
          return count;
        }, 0);

        if (totalUploaded === numberOfFiles) {
          isDownloading.value = false;
          disableUploadButton.value = true;
          emitter.emit('vf-fetch', {params: {q: 'index', adapter: props.current.adapter, path: props.current.dirname}});
        }
      }
      break;
    case "limitExceeded":
      emitter.emit('vf-modal-close');
      emitter.emit('vf-toast-push', {label: t('Limit exceeded.')});

      const queueIdx = queue.value.findIndex((item) => item.id === params[0]);
      if (queueIdx !== -1) {
        const currentDir = getCurrentDir(props.currentWalletId, props.current.dirname);

        emitter.emit('vf-fetch', {
          params:
              {
                q: 'index',
                adapter: props.current.adapter,
                path: props.current.dirname,
                uploadingWalletId: props.currentWalletId,
                uploadingCurrentDir: currentDir,
                uploadingFilename: queue.value[queueIdx].name,
                status: 'limit_exceeded'
              }
        });

        queue.value.splice(queueIdx, 1);
      }
      break;
  }
});

const updateCurrFile = () => {
  currFile.value += 1;
};

const handleEncryptedFilesDownload = async () => {
  numberOfFiles = files.value.length;
  prepareFile();
};

const prepareFile = async () => {
  // send file name to sw
  let fileName = encodeURIComponent(files.value[currFile.value].name + ".enc");
  console.trace("prepareFile")
  await sendMessage('hat-sh', [ "prepareFileNameEnc", fileName ], 'background');
};

const startEncryption = (method) => {
  // file is plupload object, to get native file use file.getSource()
  file.getSource()
      .slice(0, CHUNK_SIZE).getSource()
      .arrayBuffer()
      .then(async (chunk) => {
        index = CHUNK_SIZE;

        const chunkString = encodeArrayBufferToUrlSafeBase64(chunk);

        if (method === "secretKey") {
          await sendMessage('hat-sh', [ "encryptFirstChunk", chunkString, index >= file.size, file.id ], 'background');
        }
        if (method === "publicKey") {
          await sendMessage('hat-sh', [ "asymmetricEncryptFirstChunk", chunkString, index >= file.size, file.id ], 'background');
        }
      });

};

const kickOffEncryption = async () => {
  if (currFile.value <= numberOfFiles - 1) {
    file = files.value[currFile.value];

    queue.value[queue.value.findIndex((item) => item.id === file.id)].status = 'encrypting';

    // window.open(`file`, "_self");
    const currentDir = getCurrentDir(props.currentWalletId, props.current.dirname);

    emitter.emit('vf-fetch', {params:
          {
            q: 'index',
            adapter: props.current.adapter,
            path: props.current.dirname,
            uploadingWalletId: props.currentWalletId,
            uploadingCurrentDir: currentDir,
            uploadingFilename: file.name,
            status: 'uploading'
          }
    });

    await sendMessage('hat-sh', [ "doStreamFetch",
      `${CONFIG.API_HOST}/api/objects/` + props.currentWalletId + '?pathType=file' + '&path=' + currentDir + encodeURIComponent(file.name),
      user?.value.token, file.id
    ], 'background');

    isDownloading.value = true;

    if (encryptionMethodState === "publicKey") {

      let mode = "derive";

      await sendMessage('hat-sh', [ "requestEncKeyPair", privateKey, publicKey, mode ], 'background');
    }

    if (encryptionMethodState === "secretKey") {
      await sendMessage('hat-sh', [ "requestEncryption", JSON.stringify(user?.value.unlockPassword) ], 'background');
    }
  } else {
    // console.log("out of files")
  }
};

const continueEncryption = (e) => {
  // file is plupload object, to get native file use file.getSource()
  file.getSource()
      .slice(index, index + CHUNK_SIZE).getSource()
      .arrayBuffer()
      .then(async (chunk) => {
        index += CHUNK_SIZE;

        console.log("chunk " + index, chunk)
        const chunkString = encodeArrayBufferToUrlSafeBase64(chunk);

        await sendMessage('hat-sh', [ "encryptRestOfChunks", chunkString, index >= file.size, file.id ], 'background');
      });
};

const humanFileStatus = (status) => {
  if (status === 'encrypting') return 'Encrypting';
  if (status === 'encrypted') return 'Encrypted. Uploading...';
  if (status === 'uploaded') return 'Uploaded';
}

</script>
