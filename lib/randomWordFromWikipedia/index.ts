import Axios from "axios";

function randomWordFromWikipedia(lang: string, n = 1) {
  if (n <= 0 || n > 10) {
    throw new TypeError(`Expected a -n (1 - 10), got ${n}`);
  }
  // rnlimit: API limit 10 or less
  const url = `https://${lang || "en"}.wikipedia.org/w/api.php?format=json&action=query&list=random&rnnamespace=0&rnlimit=${n}`;
  return Axios.get(url, {})
    .then((resp) => resp.data)
    .then((data) => {
      const words = data.query.random as { title: string }[];
      return words.slice(-n).map((v) => v.title);
    });
}

export default randomWordFromWikipedia;
