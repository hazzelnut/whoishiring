import { browser } from '$app/environment';
import { writable } from 'svelte/store';
 
interface SavedJobs {
  [storyId: string]: number[];
}

const defaultValue: SavedJobs = {};
let initialValue = defaultValue;

if (browser) {
  try {
    initialValue = localStorage.savedJobs ? JSON.parse(localStorage.savedJobs) : defaultValue
  } catch(e) {
    console.error('localStorage.savedJobs is not a valid JSON string. Error: ', e)
  }
}

export const savedJobs = writable<SavedJobs>(initialValue);
 
savedJobs.subscribe((value) => {
  if (browser) {
    localStorage.savedJobs = JSON.stringify(value);
  }
});
 