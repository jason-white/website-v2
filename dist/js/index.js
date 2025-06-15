const spotifyWrapper = document.querySelector(".spotify");

const artistTemplate = (artistObject) =>
  `<a href="${artistObject.href}">${artistObject.name}</a>`;

spotifyWrapper.innerHTML = `<p>Loading...</p>`;

fetch("/.netlify/functions/spotify")
  .then((res) => res.json())
  .then(({ url, name, artists, albumName, artworkUrl }) => {
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
        <img class="artwork" src="${artworkUrl}" alt="Cover art for the album ${albumName}" />
    `;
  })
  .catch((err) => {
    console.error(err);
    spotifyWrapper.innerHTML = `<p>Error loading song info.</p>`;
  });
