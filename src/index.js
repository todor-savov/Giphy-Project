import {
  getGifsById,
  searchByString,
  getFavoriteGifsById,
  uploadGif,
  getRandomGif,
} from "./requests/request-service.js";
import { generateUploadForm } from "./views/upload-view.js";
import { renderHome, trendingTitle } from "./views/trending-view.js";
import { renderDetails, Details } from "./views/display-details.js";
import { q } from "./events/helpers.js";
import { toggleFavoriteStatus } from "./events/favorites-events.js";
import { aboutView } from "./views/about-view.js";

if (!localStorage.getItem("uploadedGifs")) {
  localStorage.setItem("uploadedGifs", JSON.stringify([]));
}

const addToDOM = async (uploadedGifs) => {
  document.querySelector("div#container").innerHTML =
    uploadedGifs.length !== 0
      ? await getGifsById(uploadedGifs.join(","))
      : "No Gif images uploaded.";
};

document.addEventListener("DOMContentLoaded", async () => {
  const container = q("#container");
  container.appendChild(trendingTitle());
  container.appendChild(await renderHome());
  container.appendChild(Details());

  // add global listener for "click" events -> filter clicks by element id
  document.addEventListener("click", async (event) => {
    /* renderDetails */
    const detailsDiv = q(".divDetails");
    if (detailsDiv) {
      if (event.target.classList.contains("giphyImg")) {
        await renderDetails(event.target.id, detailsDiv);
        detailsDiv.style.display = "block";
      } else if (
        event.target.className !== "giphyImg" &&
        event.target.className !== "divDetails" &&
        event.target.className !== "favorite" &&
        event.target.className !== "favorite active"
      ) {
        detailsDiv.style.display = "none";
      }
    }
    /* About */
    if (event.target.id === "about") {
      event.preventDefault();
      document.querySelector("div#container").innerHTML = aboutView();
    }
    /* Search */
    if (event.target.id === "searchBtn") {
      const searchString = document.querySelector("input#search").value;
      document.querySelector("div#container").innerHTML = await searchByString(
        searchString
      );
    }

    /* Upload form */
    if (event.target.id === "uploadNav") {
      document.querySelector("div#container").innerHTML =
        await generateUploadForm();
    }

    /* History section (see uploaded gifs) */
    if (event.target.id === "uploadedGifs") {
      const uploadedGifs = JSON.parse(localStorage.getItem("uploadedGifs"));
      addToDOM(uploadedGifs);
    }

    /* Delete Gif button */
    if (event.target.id === "deleteUploadedGif") {
      const idToRemove = event.target.parentNode.querySelector("img").id;
      const uploadedGifs = JSON.parse(localStorage.getItem("uploadedGifs"));
      uploadedGifs.splice(uploadedGifs.indexOf(idToRemove), 1);
      localStorage.setItem("uploadedGifs", JSON.stringify(uploadedGifs));
      addToDOM(uploadedGifs);
    }

    /* Clicking on heart icons */
    if (event.target.classList.contains("favorite")) {
      const movieId = event.target.dataset.movieId;
      toggleFavoriteStatus(movieId);
    }

    /* Favorites page */
    if (event.target.id === "favorites") {
      event.preventDefault();
      const favorites = JSON.parse(localStorage.getItem("favorites"));
      if (favorites.length === 0) {
        document.querySelector("div#container").innerHTML = `
            No favorite Gif images added yet.<br><br><br>
            ${await getRandomGif()}
        `;
      } else {
        document.querySelector("div#container").innerHTML = await getFavoriteGifsById(favorites.join(","));
      }
    }

  });

  /* Upload form submission */
  document.addEventListener("submit", async (event) => {
    if (event.target.id === "myUploadForm") {
      event.preventDefault();
      const formdata = new FormData();
      formdata.append("file", document.querySelector("input#file").files[0]);
      uploadGif(formdata);
    }
  });
});
