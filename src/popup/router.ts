import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteParams, RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import { isAuthorized } from '~/store/user'

export const routes: RouteRecordRaw[] = [
    {
        name: 'home',
        path: '/',
        component: Home,
    },
    {
        name: 'login',
        path: '/login',
        component: () => import('./pages/Login.vue'),
        beforeEnter: () => !isAuthorized(),
    },
];
export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export type AppRouteNames =
    | 'login'
    | 'home'


export function routerPush (name: AppRouteNames, params?: RouteParams): ReturnType<typeof router.push> {
    return params !== undefined
        ? router.push({
            name,
            params,
        })
        : router.push({ name })
}
