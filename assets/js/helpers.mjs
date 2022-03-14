/**
 * Returns an array of Promises that resolve
 * once the passed image loads, so
 * you can use Promise.all()
 * to only start doing canvas stuff
 * when all the images are loaded.
 * @param {HTMLImageElement[]} imgs Images to listen on
 * @returns {Promise<void>[]}
 */
export function promisifyLoad(imgs) {
  // Get rid of error
  if (!Array.isArray(imgs)) return;

  return imgs.map(
    (img) =>
      new Promise((resolve) => {
        img.addEventListener("load", () => {
          resolve();
        });
      })
  );
}

/**
 * Generates an array of stars.
 * @param {number} num The number of stars to generate
 * @param {number} width Width of canvas
 * @param {number} height Height of canvas
 */
export function generateStars(num, width, height) {
  const _stars = [];

  for (let i = 0; i < num; i++) {
    _stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3,
    });
  }

  return _stars;
}

/**
 * Formats a date using the formatting of the passed timezone.
 * @param {Date} date Date instance
 * @param {string} zone The zone
 */
export const formatDate = (date, zone) =>
  `${date.toLocaleString("en-IE", { timeZone: zone })} (${zone.replace('_', ' ')})`;

/**
 * Updates elements based on the id and content passed in object.
 * @param {Record<string, string>} info Object with id and content
 */
export function updateInfoElements(info) {
  for (const [id, content] of Object.entries(info)) {
    document.getElementById(
      id
    ).innerHTML = content;
  }
}
