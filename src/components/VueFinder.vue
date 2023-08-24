<template>
  <div class="vuefinder">
    <div :class="darkMode ? 'dark': ''">
      <div
          :class="fullScreen ? 'fixed w-screen inset-0 z-20' : 'relative rounded-md'"
          :style="!fullScreen ? 'max-height: ' + maxHeight : ''"
          class="border flex flex-col bg-white dark:bg-gray-800 text-gray-700 dark:text-neutral-400 border-neutral-300 dark:border-gray-900 min-w-min select-none"
          @mousedown="emitter.emit('vf-contextmenu-hide')" @touchstart="emitter.emit('vf-contextmenu-hide')">
        <v-f-toolbar :data="fetchData" />
        <v-f-breadcrumb :data="fetchData" :currentWalletId="currentWallet.id"/>
        <v-f-explorer :view="view" :data="fetchData"/>
        <v-f-statusbar :data="fetchData"/>
      </div>

      <component v-if="modal.active" :is="'v-f-modal-'+ modal.type" :selection="modal.data" :current="fetchData" :currentWalletId="currentWallet.id"/>
      <v-f-context-menu :current="fetchData"/>
      <iframe id="download_frame" style="display:none;"></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VueFinder'
};
</script>

<script setup>
import {computed, defineProps, onMounted, provide, reactive, ref} from 'vue';
import ajax from '../utils/ajax.js';
import mitt from 'mitt';
import {useStorage} from '../composables/useStorage.js';
import {useApiUrl} from '../composables/useApiUrl.js';
import VFToolbar from '../components/Toolbar.vue';
import VFExplorer from '../components/Explorer.vue';
import VFStatusbar from '../components/Statusbar.vue';
import VFBreadcrumb from '../components/Breadcrumb.vue';
import VFContextMenu from '../components/ContextMenu.vue';
import {useI18n} from '../composables/useI18n.js';
import {api, isFetchError} from "~/services";
import {CONFIG} from "~/env";
import getCurrentDir, {storageName} from "~/utils/getCurrentDir";
import {saveBlobToMachine} from "~/utils/saveBlobToMachine";
import {useWalletsStore} from "~/store/wallet";
import {storeToRefs} from "pinia";
import {useUserStore} from "~/store/user";
import {loginOrRegisterUser} from "~/services/backend";
const { allWallets, pushNotification } = useWalletsStore()
const { user } = storeToRefs(useUserStore())
const selectedWallet = ref(null)

const props = defineProps({
  url: {
    type: [String],
  },
  id: {
    type: String,
    default: 'vf'
  },
  dark: {
    type: Boolean,
    default: false
  },
  usePropDarkMode: {
      type: Boolean,
      default: false
  },
  locale: {
      type: String,
      default: 'en'
  },
  maxHeight: {
    type: String,
    default: '600px'
  },
  maxFileSize: {
    type: String,
    default: '10mb'
  },
  postData: {
    type: Object,
    default: {}
  }
});
const emitter = mitt();
const {setStore, getStore} = useStorage(props.id);
const adapter =ref(getStore('adapter'));

provide('emitter', emitter);
provide('storage', useStorage(props.id));
provide('postData', props.postData);
provide('adapter', adapter);
provide('maxFileSize', props.maxFileSize);
provide('usePropDarkMode', props.usePropDarkMode);

// Lang Management
const i18n = useI18n(props.id, props.locale, emitter);
const {t} = i18n;
provide('i18n', i18n);

const {apiUrl, setApiUrl} = useApiUrl();
setApiUrl(props.url);

const fetchData = reactive({adapter: adapter.value, storages: [], dirname: '.', files: []});

// View Management
const view = ref(getStore('viewport', 'grid'));
const darkMode = props.usePropDarkMode ? computed(() => props.dark) : ref(getStore('darkMode', props.dark));

emitter.on('vf-darkMode-toggle', () => {
  darkMode.value = !darkMode.value;
  setStore('darkMode', darkMode.value);
});

const loadingState = ref(false);

provide('loadingState', loadingState);

const fullScreen = ref(getStore('full-screen', false));

emitter.on('vf-fullscreen-toggle', () => {
  fullScreen.value = !fullScreen.value;
  setStore('full-screen', fullScreen.value);
});

emitter.on('vf-view-toggle', (newView) => {
  view.value = newView;
});

// Modal Management
const modal = reactive({
  active: false,
  type: 'delete',
  data: {}
});

emitter.on('vf-modal-close', () => {
  modal.active = false;
});

emitter.on('vf-modal-show', (item) => {
  modal.active = true;
  modal.type = item.type;
  modal.data = item;
});

const updateItems = (data) => {
  Object.assign(fetchData, data);
  emitter.emit('vf-nodes-selected', {});
  emitter.emit('vf-explorer-update');
};

let controller;
emitter.on('vf-fetch-abort', () => {
  controller.abort();
  loadingState.value = false;
});

onMounted(() => {
  selectedWallet.value = localStorage.getItem('lastSelectedWallet') || allWallets[0].id;
})

const currentWallet = computed(() => {
  if (!Array.isArray(allWallets))
    return null;

  const selected = allWallets.filter(w => w.id === selectedWallet)[0];

  if (!selected)
    return allWallets[0];

  return selected;
})



const getObjects = async (path, params = {}) => {
  const currentDir = getCurrentDir(currentWallet.value.id, path);
  const pathType = currentDir.endsWith('/') ? 'dir' : 'file';
  console.log('%cGet objects: ' + currentDir, 'background: #222; color: #bada55')
  let data = await api.objects.objectsDetail(currentWallet.value.id, {...params,
    query: {
      pathType: pathType,
      path: currentDir
  }}).then(res => res.data);
  console.log('%cdata: ', 'background: #222; color: #bada55', data)
  if (data.status === 404) {
    return data;
  }

  data.adapter = storageName;
  data.storages = [storageName];
  data.dirname = storageName + '://' + currentWallet.value.id + (!currentDir.startsWith('/') ? '/' : '') + currentDir;
  if (!data.entries) {
    data.entries = [];
  }
  data.files = data.entries.map((entry) => {
    const path = entry.name.replace(/\/$/, '').replace(/^\//g, '');
    const filename = path.split('/').pop();
    let extension = '';
    if (entry.name.endsWith('/')) {
      entry.type = 'dir';
    } else {
      entry.type = 'file';
      extension = name.split('.').pop();
      entry.mime_type = '';
    }
    entry.basename = filename;
    entry.path = storageName + '://' + path;
    entry.extension = extension;
    entry.file_size = entry.size;
    entry.visibility = 'public'
    entry.last_modified = '';
    entry.extra_metadata = [];
    entry.storage = storageName;

    delete entry.name;
    delete entry.size;

    return entry;
  });
  delete data.entries;
  console.log(data)
  return data;
};

watchEffect(async () => {
  if (!currentWallet.value)
    return;

  if (user?.value.token) {
    const r = await getObjects('/');
    if (r.status === 404) {
      await createFolder('', '');
    }
    emitter.emit('vf-fetch', {params: {q: 'index', path:'/', adapter: (adapter.value)}});
  } else {
    await loginOrRegisterUser(currentWallet.value.id, user?.value.unlockPassword);
  }
})

const createFolder = async (path, name) => {
  const currentDir = getCurrentDir(currentWallet.value.id, path);
  path = currentDir + name
  if (!currentDir.endsWith('/')) {
    path += '/'
  }

  const data = await api.objects.objectsUpdate(currentWallet.value.id, null, {query: {pathType: 'dir', path: path}} ).then(res => res.data);
  return data;
};

emitter.on('vf-fetch', ({params, onSuccess = null, onError = null}) => {
  if (['index', 'search'].includes(params.q)) {
    if (controller) {
      controller.abort();
    }
    loadingState.value = true;
  }

  controller = new AbortController();
  const signal = controller.signal;


  const deleteObjects = async (path, items) => {
    const currentDir  = getCurrentDir(currentWallet.value.id, path);

    const deletionPromises = items.map(async item => {
      let itemPath = item.path.replace(storageName + '://' + currentWallet.value.id + '/', '');
      itemPath += (item.type === 'dir' && !itemPath.endsWith('/') ? '/' : '')
      const result = await api.objects.objectsDelete2(currentWallet.value.id, {query: {pathType: item.type, path: itemPath}})
      return result.data;
    });

    try {
      const deletedData = await Promise.all(deletionPromises);
      return deletedData;
    } catch (error) {
      throw error;
    }
  };


  if (params.q === 'newfolder') {
    const data = createFolder(params.path, params.name).then(data => {
      if (onSuccess) {
        onSuccess(data);
        emitter.emit('vf-modal-close');
        emitter.emit('vf-fetch', {params:{q: 'index', adapter: adapter, path: params.path}});
      }
    })
    .catch((e) => {
      if (onError) {
        onError(e.error);
      }
    })
  } else if (params.q === 'delete') {
    const data = deleteObjects(params.path, params.items).then(data => {
      if (onSuccess) {
        onSuccess(data);
        emitter.emit('vf-modal-close');
        emitter.emit('vf-fetch', {params:{q: 'index', adapter: adapter, path: params.path}});
      }
    })
    .catch((e) => {
      if (onError) {
        onError(e.error);
      }
    })
  } else if (params.q === 'index') {
    getObjects(params.path, { signal }).then(data => {
      adapter.value = data.adapter;
      if (['index', 'search'].includes(params.q)) {
        loadingState.value = false;
      }
      emitter.emit('vf-modal-close');
      console.log(data)
      updateItems(data);
      if (onSuccess) {
        onSuccess(data);
      }
    })
    .catch((e) => {
      if (onError) {
        onError(e.error);
      }
    })
    .finally(() => {
    });
  }


  // ajax(apiUrl.value, {params, signal})
  //     .then(data => {
  //       adapter.value = data.adapter;
  //       if (['index', 'search'].includes(params.q)) {
  //         loadingState.value = false;
  //       }
  //       emitter.emit('vf-modal-close');
  //       updateItems(data);
  //       onSuccess(data);
  //     })
  //     .catch((e) => {
  //       if (onError) {
  //         onError(e);
  //       }
  //     })
  //     .finally(() => {
  //     });
});

emitter.on('vf-download', async (params) => {
  // document.getElementById('download_frame').src = url;

  const downloadObject = async (path) => {
    const response = await api.objects.objectsDetail(
        currentWallet.value.id,
        { query: { pathType: 'file',
            path: path.replace(storageName + '://', '').replace(currentWallet.value.id + '/', ''),
            serviceName: 'worker', format: 'blob' }, format: 'blob'}
    );
    return response.data;
  };

  const data = await downloadObject(params.path);
  if (data) {
    saveBlobToMachine(params.path.split('/').pop(), data);
  }

  emitter.emit('vf-modal-close');
});

</script>
