const STORAGE_KEY = "writeup.profile";

const MY_PROFILE = {
  name: "Sasha",
  email: "sashamistiuk1@gmail.com",
  bio: "Тут буде інформація про користувача. Коротка біографія, жанри, інші деталі.",
  avatarDataUrl: ""
};

/**
 * Task #59: Author Data for Reader View
 */
const AUTHOR_DATA = {
  name: "J. K. Rowling",
  email: "jk.rowling@gmail.com",
  bio: "J. K. Rowling is the British novelist who wrote Harry Potter. A seven-volume Series about a young wizard.",
  avatarDataUrl: ""
};

/**
 * Fetches profile based on URL context for Task #59
 */
export async function getProfile() {
  const isAuthorPage = window.location.pathname.includes("author");

  if (isAuthorPage) {
    return AUTHOR_DATA; 
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MY_PROFILE));
    return MY_PROFILE;
  }
  return JSON.parse(raw);
}

export async function updateProfile(patch) {
  const current = await getProfile();
  const updated = { ...current, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
  */
}