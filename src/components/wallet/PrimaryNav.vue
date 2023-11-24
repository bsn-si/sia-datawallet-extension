<template>
  <div class="primary-nav">
    <div class="upper">
      <div class="nav-logo">
        <div class="w-[174px] h-14 pl-4 pr-2 py-2 justify-start items-center gap-2.5 inline-flex">
          <div class="w-6 h-6 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M24.6975 13.7785C25.971 18.5331 23.1065 23.42 18.2931 24.6938C16.7637 25.0985 15.2201 25.0903 13.7838 24.7382C16.0787 22.5545 17.1355 19.2363 16.2531 15.9834C15.6292 13.6838 17.013 11.3167 19.3412 10.7006C21.6694 10.0844 24.0661 11.4511 24.69 13.7506L24.6975 13.7785Z" stroke="#19CF86" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5186 3.59488C12.0508 0.128271 17.7681 0.135034 21.2917 3.61528C22.4113 4.72108 23.1759 6.04556 23.5854 7.45003C20.5231 6.579 17.0851 7.33412 14.6741 9.71539C12.9697 11.3987 10.2023 11.3987 8.49788 9.71539C6.79351 8.03203 6.79351 5.29864 8.49788 3.61528L8.5186 3.59488Z" stroke="#19CF86" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.67866 22.5253C2.87288 21.2374 0.0202289 16.3437 1.31 11.5897C1.71978 10.0791 2.49886 8.76292 3.52562 7.71045C4.29303 10.7653 6.67406 13.3283 9.96758 14.2C12.2958 14.8161 13.6795 17.1833 13.0557 19.4828C12.4318 21.7823 10.0352 23.149 7.70689 22.5328L7.67866 22.5253Z" stroke="#19CF86" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="text-emerald-500 text-md font-medium font-['Roboto'] leading-tight tracking-tight ml-1.5">Siacoin (SC)</div>
        </div>
      </div>
      <transition name="fade" mode="out-in" appear>
        <div v-if="offline" class="connect-status">Offline</div>
      </transition>

      <div class="w-[180px] h-14 pl-4 pr-6 py-4 justify-start items-center gap-3 inline-flex">
        <div class="w-[140px] h-[23px] relative">
          <div class="w-[140px] h-1 left-0 top-[19px] absolute bg-neutral-700 rounded justify-start items-center inline-flex" :style="{'padding-right': currentUserUsagePercentageToPaggingRight+'%'}">
            <div class="w-full h-1 relative rounded" :class="stageColor"></div>
          </div>
          <div class="w-[50px] h-3.5 left-[90px] top-0 absolute text-right text-neutral-100 text-xs font-normal font-['Roboto'] leading-tight tracking-tight">{{planLimit}}</div>
          <div class="w-[50px] h-3.5 left-0 top-0 absolute text-neutral-100 text-xs font-normal font-['Roboto'] leading-tight tracking-tight">{{currentUserUsage}}</div>
        </div>
      </div>

      <router-link :to="{ name: 'wallets' }" class="menu-item">
        <menu-item :is-active="path==='/wallets'">
          <div class="svg-c">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM14 8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8ZM18 17C17.8 16.29 14.7 15 12 15C9.3 15 6.2 16.29 6 17.01V18H18V17ZM4 17C4 14.34 9.33 13 12 13C14.67 13 20 14.34 20 17V20H4V17Z"/>
            </svg>
          </div>
          <div class="caption">Account</div>
        </menu-item>
      </router-link>

      <router-link :to="{ name: 'home' }" class="menu-item">
        <menu-item :is-active="path==='/'">
          <div class="svg-c">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" >
              <path d="M9.17 6L11.17 8H20V18H4V6H9.17ZM10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" />
            </svg>
          </div>
          <div class="caption">Files</div>
        </menu-item>
      </router-link>

      <router-link :to="{ name: 'history' }" class="menu-item">
        <menu-item :is-active="path==='/history'">
          <div class="svg-c">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" >
              <mask id="mask0_35_368" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                <rect width="24" height="24"/>
              </mask>
              <g mask="url(#mask0_35_368)">
                <path d="M12 21C9.7 21 7.69583 20.2375 5.9875 18.7125C4.27917 17.1875 3.3 15.2833 3.05 13H5.1C5.33333 14.7333 6.10417 16.1667 7.4125 17.3C8.72083 18.4333 10.25 19 12 19C13.95 19 15.6042 18.3208 16.9625 16.9625C18.3208 15.6042 19 13.95 19 12C19 10.05 18.3208 8.39583 16.9625 7.0375C15.6042 5.67917 13.95 5 12 5C10.85 5 9.775 5.26667 8.775 5.8C7.775 6.33333 6.93333 7.06667 6.25 8H9V10H3V4H5V6.35C5.85 5.28333 6.8875 4.45833 8.1125 3.875C9.3375 3.29167 10.6333 3 12 3C13.25 3 14.4208 3.2375 15.5125 3.7125C16.6042 4.1875 17.5542 4.82917 18.3625 5.6375C19.1708 6.44583 19.8125 7.39583 20.2875 8.4875C20.7625 9.57917 21 10.75 21 12C21 13.25 20.7625 14.4208 20.2875 15.5125C19.8125 16.6042 19.1708 17.5542 18.3625 18.3625C17.5542 19.1708 16.6042 19.8125 15.5125 20.2875C14.4208 20.7625 13.25 21 12 21ZM14.8 16.2L11 12.4V7H13V11.6L16.2 14.8L14.8 16.2Z" />
              </g>
            </svg>
          </div>
          <div class="caption">History</div>
        </menu-item>
      </router-link>


    </div>
    <div class="lower">
      <a class="menu-item" @click.prevent="logout">
        <menu-item :is-active="false">
          <div class="svg-c">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <mask id="mask0_41_258" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                <rect width="24" height="24"/>
              </mask>
              <g mask="url(#mask0_41_258)">
                <path d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V15H5V19H19V5H5V9H3V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H19C19.55 3 20.0208 3.19583 20.4125 3.5875C20.8042 3.97917 21 4.45 21 5V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5ZM10.5 17L9.1 15.55L11.65 13H3V11H11.65L9.1 8.45L10.5 7L15.5 12L10.5 17Z"/>
              </g>
            </svg>
          </div>
          <div class="caption">Logout</div>
        </menu-item>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'PrimaryNav',
};
</script>


<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useWalletsStore} from "~/store/wallet";
import {useUserStore} from "~/store/user";
import {useRoute} from "vue-router";
import {CONFIG} from "~/env";
import filesize from "~/utils/filesize";

const userStore = useUserStore();
const { userUsage, activeSubscription } = storeToRefs(userStore)
const { updateUser, userLogout } = userStore
const walletsStore = useWalletsStore()
const { offline } = storeToRefs(walletsStore)
const { lockWallets } = walletsStore

const route=useRoute();
const path = computed(() =>route.path)
console.log(path.value)

const currentUserUsage = computed(() => {
  return userUsage && userUsage.value && userUsage.value.customer_usage ? filesize(userUsage.value.customer_usage.charges_usage[0].units) : '';
});

const currentUserUsagePercentageToPaggingRight = computed(() => {
  const planCode = activeSubscription.value.plan_code;
  if (userUsage && userUsage.value) {
    if (planCode.startsWith('SMALL'))
      return 100 - parseInt(userUsage.value.customer_usage.charges_usage[0].units) / (parseFloat(CONFIG.SMALL_PLAN_LIMIT) * 1024 * 1024) * 100;
    if (planCode.startsWith('MEDIUM'))
      return 100 - parseInt(userUsage.value.customer_usage.charges_usage[0].units) / (parseFloat(CONFIG.MEDIUM_PLAN_LIMIT) * 1024 * 1024) * 100;
    if (planCode.startsWith('LARGE'))
      return 100 - parseInt(userUsage.value.customer_usage.charges_usage[0].units) / (parseFloat(CONFIG.LARGE_PLAN_LIMIT) * 1024 * 1024) * 100;
  }
  return 100;
});

const stageColor = computed(() => {
  const percentageUsage = 100 - currentUserUsagePercentageToPaggingRight.value;
  if (percentageUsage < 33)
    return 'bg-green-300';
  else if (percentageUsage < 66)
    return 'bg-yellow-100';
  else
    return 'bg-rose-300';
})

const planLimit = computed(() => {
  const planCode = activeSubscription.value.plan_code;
  if (planCode.startsWith('SMALL')) {
    return filesize(CONFIG.SMALL_PLAN_LIMIT * 1024 * 1024);
  } else if (planCode.startsWith('MEDIUM')) {
    return filesize(CONFIG.MEDIUM_PLAN_LIMIT * 1024 * 1024);
  } else if (planCode.startsWith('LARGE')) {
    return filesize(CONFIG.LARGE_PLAN_LIMIT * 1024 * 1024);
  }
  return '';
});

const logout = async () => {
  await userLogout();
}
</script>

<style lang="stylus" scoped>
@require "../../popup/styles/vars";
.primary-nav {
  display: none;
  padding: 12px;
  grid-template-rows: repeat(2, auto);
  align-content: space-between;
  background: bg-dark-accent;
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.22);

  @media screen and (min-width: 767px) {
    display: grid;
  }
}

body.mac {
  .primary-nav {
    padding-top: 30px;
  }
}

.connect-status {
  paddding: 5px;
  background: negative-accent;
  font-size: 0.9rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-logo {
  //border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  //svg {
  //  display: block;
  //  width: 3rem;
  //  height: auto;
  //  margin: 0 auto 15px;
  //}
}

.upper, .lower {
  width: 100%;
}

a.menu-item {
  display: block;
  //width: 75px;
  //height: 75px;
  //text-align: center;
  //color: rgba(255, 255, 255, 0.54);
  color: #CAC4D0;
  //font-size: 0.9rem;
  //line-height: 75px;
  cursor: pointer;
  //transition: all 0.3s linear;

  .svg-c {
    width: 24px; height: 24px; position: relative;
  }

  .caption {
    flex: 1 1 0; font-size: 14px; font-family: Roboto; font-weight: 500; line-height: 20px; letter-spacing: 0.10px; word-wrap: break-word;
  }

  &:hover, &:focus, &:active, &.router-link-exact-active {
    color: primary;
    text-decoration: none;
    svg {
      fill: primary;
    }
  }

  svg {
  //  width: 1.5rem;
  //  height: auto;
  //  margin: auto;

    fill: #CAC4D0;

  }

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
