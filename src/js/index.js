const spotifyWrapper = document.querySelector(".spotify");

const artistTemplate = (artistObject) =>
  `<a href="${artistObject.href}">${artistObject.name}</a>`;

fetch("https://v2.jasonwhite.us/.netlify/functions/spotify")
  .then((res) => res.json())
  .then(({ url, name, artists, artworkUrl }) => {
    spotifyWrapper.innerHTML = `<p>
      <span class="artists">${artists
        .map((artist) => artistTemplate(artist))
        .join(", ")} - </span>

        <span class="song">
            <a href="${url}">
                ${name}
            </a>
        </span>
    </p>
        <img class="artwork" src="${artworkUrl}"/>`;
  })
  .catch((err) => console.error(err));
