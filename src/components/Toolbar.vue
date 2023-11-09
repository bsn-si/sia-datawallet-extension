<template>
  <div class="border-neutral-300 flex justify-between items-center py-1 text-sm">
    <div class="flex text-center" v-if="!searchQuery.length">

      <div class="w-[150px] rounded-[100px] border border-neutral-400 flex-col justify-center items-center inline-flex mr-2 cursor-pointer"
           :aria-label="t('Upload')" data-microtip-position="bottom" role="tooltip"
           @click="emitter.emit('vf-modal-show', {type:'upload', items: selectedItems})">
        <div class="self-stretch pl-4 pr-6 py-1 bg-purple-300 bg-opacity-10 justify-center items-center gap-2 inline-flex rounded-[100px]">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
              <mask id="mask0_22_2548" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                <rect y="0.5" width="24" height="24" fill="#D9D9D9"/>
              </mask>
              <g mask="url(#mask0_22_2548)">
                <path d="M12 16.5L7 11.5L8.4 10.05L11 12.65V4.5H13V12.65L15.6 10.05L17 11.5L12 16.5ZM6 20.5C5.45 20.5 4.97917 20.3042 4.5875 19.9125C4.19583 19.5208 4 19.05 4 18.5V15.5H6V18.5H18V15.5H20V18.5C20 19.05 19.8042 19.5208 19.4125 19.9125C19.0208 20.3042 18.55 20.5 18 20.5H6Z" fill="#D0BCFF"/>
              </g>
            </svg>
          </div>
          <div class="text-center text-purple-300 text-sm font-medium font-['Roboto'] leading-tight tracking-tight">Upload file</div>
        </div>
      </div>

      <div class="w-[150px] rounded-[100px] border border-neutral-400 flex-col justify-center items-center inline-flex mr-2 cursor-pointer"
           :aria-label="t('New Folder')" data-microtip-position="bottom-right" role="tooltip"
           @click="emitter.emit('vf-modal-show', {type:'new-folder', items: selectedItems})">
        <div class="self-stretch pl-4 pr-6 py-1 bg-purple-300 bg-opacity-10 justify-center items-center gap-2 inline-flex rounded-[100px]">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
              <mask id="mask0_22_2648" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="25">
                <rect x="0.5" y="0.5" width="24" height="24" fill="#D9D9D9"/>
              </mask>
              <g mask="url(#mask0_22_2648)">
                <path d="M14.5 16.5H16.5V14.5H18.5V12.5H16.5V10.5H14.5V12.5H12.5V14.5H14.5V16.5ZM4.5 20.5C3.95 20.5 3.47917 20.3042 3.0875 19.9125C2.69583 19.5208 2.5 19.05 2.5 18.5V6.5C2.5 5.95 2.69583 5.47917 3.0875 5.0875C3.47917 4.69583 3.95 4.5 4.5 4.5H10.5L12.5 6.5H20.5C21.05 6.5 21.5208 6.69583 21.9125 7.0875C22.3042 7.47917 22.5 7.95 22.5 8.5V18.5C22.5 19.05 22.3042 19.5208 21.9125 19.9125C21.5208 20.3042 21.05 20.5 20.5 20.5H4.5ZM4.5 18.5H20.5V8.5H11.675L9.675 6.5H4.5V18.5Z" fill="#FFFEFE"/>
              </g>
            </svg>
          </div>
          <div class="text-center  text-sm font-medium font-['Roboto'] leading-tight tracking-tight">Create folder</div>
        </div>
      </div>

        <div v-if="false" class="mx-1.5"
             :aria-label="t('New File')" data-microtip-position="bottom" role="tooltip"
             @click="emitter.emit('vf-modal-show', {type:'new-file', items: selectedItems})">
          <svg xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 md:h-8 md:w-8 m-auto cursor-pointer stroke-gray-500 hover:stroke-cyan-700 dark:stroke-gray-400 dark:hover:stroke-gray-300" fill="none" viewBox="0 0 24 24" stroke="none" stroke-width="1.5">
             <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        <div v-if="false" class="mx-1.5"
             :aria-label="t('Rename')" data-microtip-position="bottom" role="tooltip"
             @click="(selectedItems.length != 1) || emitter.emit('vf-modal-show', {type:'rename', items: selectedItems})">
          <svg xmlns="http://www.w3.org/2000/svg"
                :class="(selectedItems.length == 1) ? 'cursor-pointer stroke-gray-500 hover:stroke-cyan-700 dark:stroke-gray-400 dark:hover:stroke-gray-300' : 'stroke-gray-200  dark:stroke-gray-700'"
               class="h-6 w-6 md:h-8 md:w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="none" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </div>

      <div class="w-[150px] rounded-[100px] border border-neutral-400 flex-col justify-center items-center inline-flex"
           :class="(selectedItems.length) ? 'cursor-pointer ' : ''"
           :aria-label="t('Delete')" data-microtip-position="bottom" role="tooltip"
           @click="(!selectedItems.length) || emitter.emit('vf-modal-show', {type:'delete', items: selectedItems})">
        <div class="self-stretch pl-4 pr-6 py-1 bg-purple-300 bg-opacity-10 justify-center items-center gap-2 inline-flex rounded-[100px]">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
              <mask id="mask0_22_2716" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                <rect y="0.5" width="24" height="24" fill="#D9D9D9"/>
              </mask>
              <g mask="url(#mask0_22_2716)">
                <path :style="(selectedItems.length) ? 'fill:#F2B8B5' : 'fill:#9299A4'"
                    d="M7 21.5C6.45 21.5 5.97917 21.3042 5.5875 20.9125C5.19583 20.5208 5 20.05 5 19.5V6.5H4V4.5H9V3.5H15V4.5H20V6.5H19V19.5C19 20.05 18.8042 20.5208 18.4125 20.9125C18.0208 21.3042 17.55 21.5 17 21.5H7ZM17 6.5H7V19.5H17V6.5ZM9 17.5H11V8.5H9V17.5ZM13 17.5H15V8.5H13V17.5Z" />
              </g>
            </svg>
          </div>
          <div class="text-center text-sm font-medium font-['Roboto'] leading-tight tracking-tight"
               :style="(selectedItems.length) ? 'color:#F2B8B5' : 'color:#9299A4'"
               >Delete</div>
        </div>
      </div>



        <div class="mx-1.5" v-if="false && selectedItems.length == 1 && selectedItems[0].mime_type == 'application/zip'"
             :aria-label="t('Unarchive')" data-microtip-position="bottom" role="tooltip"
              @click="(!selectedItems.length) || emitter.emit('vf-modal-show', {type:'unarchive', items: selectedItems})">
          <svg xmlns="http://www.w3.org/2000/svg"
               :class="(selectedItems.length) ? 'cursor-pointer stroke-gray-500 hover:stroke-cyan-700 dark:stroke-gray-400 dark:hover:stroke-gray-300' : 'stroke-gray-200  dark:stroke-gray-700'"
               class="h-6 w-6 md:h-8 md:w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="none" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <div class="mx-1.5" v-else-if="false"
             :aria-label="t('Archive')" data-microtip-position="bottom" role="tooltip"
              @click="(!selectedItems.length) || emitter.emit('vf-modal-show', {type:'archive', items: selectedItems})">
          <svg xmlns="http://www.w3.org/2000/svg"
               :class="(selectedItems.length) ? 'cursor-pointer stroke-gray-500 hover:stroke-cyan-700 dark:stroke-gray-400 dark:hover:stroke-gray-300' : 'stroke-gray-200  dark:stroke-gray-700'"
               class="h-6 w-6 md:h-8 md:w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="none" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>

    </div>

    <div class="flex text-center" v-else>
      <div class="pl-2"> {{ t('Search results for') }} <span class="dark:bg-gray-700 bg-gray-200 text-xs px-2 py-1 rounded">{{ searchQuery }}</span></div>
       <svg
            class="animate-spin p-0.5 h-5 w-5 text-white ml-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"  v-if="isLoading()">
        <circle class="opacity-25 stroke-blue-900 dark:stroke-blue-100" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <div class="flex text-center items-center justify-end">
        <div v-if="false" v-show="!usePropDarkMode" class="mx-1.5" :aria-label="t('Dark Mode')" data-microtip-position="bottom" role="tooltip">
          <svg @click="emitter.emit('vf-darkMode-toggle')" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               class="h-6 w-6 m-auto cursor-pointer stroke-sky-500 fill-sky-100 hover:stroke-sky-600 dark:stroke-gray-400 dark:fill-gray-400/20 dark:hover:stroke-gray-300">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        </div>

         <div v-if="false" class="mx-1.5" :aria-label="t('Toggle Full Screen')" data-microtip-position="bottom-left" role="tooltip"
               @click="setFullScreen">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-8 md:w-8 m-auto cursor-pointer stroke-gray-500 hover:stroke-cyan-700 dark:stroke-gray-400 dark:hover:stroke-gray-300" fill="none" viewBox="0 0 24 24" stroke="none" stroke-width="1.5">
                <path v-if="fullScreen" stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </div>

        <div class="mx-1.5"
             :aria-label="t('Change View')" data-microtip-position="bottom-left" role="tooltip"
             @click="searchQuery.length || emitter.emit('vf-view-toggle', view == 'list' ? 'grid' : 'list')">

          <svg xmlns="http://www.w3.org/2000/svg"
               :class="(!searchQuery.length) ? 'cursor-pointer stroke-gray-500 hover:stroke-cyan-700 dark:stroke-gray-400 dark:hover:stroke-gray-300' : 'stroke-gray-200  dark:stroke-gray-700'"
               class="h-6 w-6 md:h-8 md:w-8 m-auto" fill="none" viewBox="0 0 24 24" stroke="none" stroke-width="1.5">
              <path v-if="view == 'grid'" stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              <path v-if="view == 'list'"  stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VFToolbar'
};
</script>

<script setup>
import {inject, ref} from 'vue';

const emitter = inject('emitter')

const usePropDarkMode = inject('usePropDarkMode')

const {getStore, setStore} = inject('storage')

const {t} = inject('i18n');

const view = ref(getStore('viewport', 'grid'));

const selectedItems = ref([]);

const fullScreen = ref(getStore('full-screen', false));

const props = defineProps({
  data: Object
});

const searchQuery = ref('');

emitter.on('vf-search-query', ({newQuery}) => {
  searchQuery.value = newQuery;
});

const loadingState= inject('loadingState');
const isLoading = () => loadingState.value;

const setFullScreen = () => {
  fullScreen.value = !fullScreen.value;
  emitter.emit('vf-fullscreen-toggle');
}

emitter.on('vf-nodes-selected', (items) => {
  selectedItems.value = items;
})

emitter.on('vf-view-toggle', (newView) => {
  setStore('viewport', newView)
  view.value = newView;
})
</script>
