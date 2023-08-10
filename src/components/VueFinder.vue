<template>
  <div class="vuefinder">
    <div :class="darkMode ? 'dark': ''">
      <div
          :class="fullScreen ? 'fixed w-screen inset-0 z-20' : 'relative rounded-md'"
          :style="!fullScreen ? 'max-height: ' + maxHeight : ''"
          class="border flex flex-col bg-white dark:bg-gray-800 text-gray-700 dark:text-neutral-400 border-neutral-300 dark:border-gray-900 min-w-min select-none"
          @mousedown="emitter.emit('vf-contextmenu-hide')" @touchstart="emitter.emit('vf-contextmenu-hide')">
        <v-f-toolbar :data="fetchData" />
        <v-f-breadcrumb :data="fetchData"/>
        <v-f-explorer :view="view" :data="fetchData"/>
        <v-f-statusbar :data="fetchData"/>
      </div>

      <component v-if="modal.active" :is="'v-f-modal-'+ modal.type" :selection="modal.data" :current="fetchData"/>
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



emitter.on('vf-fetch', ({params, onSuccess = null, onError = null}) => {
  if (['index', 'search'].includes(params.q)) {
    if (controller) {
      controller.abort();
    }
    loadingState.value = true;
  }

  controller = new AbortController();
  const signal = controller.signal;



  const getObjects = async (path) => {
    const currentDir = getCurrentDir(path);

    const data = await api.objects.objectsDetail(currentDir, { signal }).then(res => res.data);
    data.adapter = storageName;
    data.storages = [storageName];
    data.dirname = storageName + '://' + currentDir;
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
    return data;
  };

  const createFolder = async (path, name) => {
    const currentDir = getCurrentDir(path);

    const data = await api.objects.objectsUpdate(currentDir + name + '/', null, {baseUrl: `${CONFIG.API_HOST}/api/worker`}).then(res => res.data);
    return data;
  };

  const deleteObjects = async (path, items) => {
    const currentDir  = getCurrentDir(path);

    const deletionPromises = items.map(async item => {
      const itemPath = item.path.replace(storageName + '://', '') + (item.type === 'dir' ? '/' : '');
      const result = await api.objects.objectsDelete2(currentDir + itemPath);
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
    getObjects(params.path).then(data => {
      adapter.value = data.adapter;
      if (['index', 'search'].includes(params.q)) {
        loadingState.value = false;
      }
      emitter.emit('vf-modal-close');
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

emitter.on('vf-download', (url) => {
  document.getElementById('download_frame').src = url;
  emitter.emit('vf-modal-close');
});

onMounted(() => {
  emitter.emit('vf-fetch', {params: {q: 'index', adapter: (adapter.value)}});
});

</script>
