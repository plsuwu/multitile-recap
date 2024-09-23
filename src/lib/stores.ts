import { writable } from 'svelte/store';

export const totalPages = writable<number>(0);
export const currentPage = writable<number>(0);
export const loading = writable<boolean>(false);
