// src/services/profileService.jsx

const STORAGE_KEY = "writeup.profile";

const DEFAULT_PROFILE = {
  name: "J. K. Rowling",
  email: "jk.rowling@gmail.com",
  bio:
    "J. K. Rowling is the British novelist who wrote Harry Potter. A seven-volume Series about a young wizard. Published from 1997 to 2002. The bestselling series in history #HYFlover 600 million copies sold.",
  avatarDataUrl: "" // base64 image from upload
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getProfile() {
  await sleep(100);
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  }
}

export async function updateProfile(patch) {
  await sleep(150);
  const current = await getProfile();
  const updated = { ...current, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}