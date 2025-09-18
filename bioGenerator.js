document.addEventListener("DOMContentLoaded", function () {
  // Get the target year from the script tag's data attribute
  const scriptTag = document.querySelector('script[src="bioGenerator.js"]');
  const targetYear = parseInt(scriptTag.getAttribute('data-year'));

  fetch("bios.json")
    .then((response) => response.json())
    .then((bios) => {
      const bioContainer = document.getElementById("bioContainer");
      const participantsList = document.getElementById("participantsList");

      // Filter bios for the specified year only
      const filteredBios = bios.filter((bio) => bio.years.includes(targetYear));

      // Shuffle bios randomly using Fisher-Yates algorithm
      for (let i = filteredBios.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredBios[i], filteredBios[j]] = [filteredBios[j], filteredBios[i]];
      }

      filteredBios.forEach((bio, index) => {
        // Create bio card
        const bioCard = document.createElement("div");
        bioCard.className = "bioCard";
        bioCard.id = bio.id;
        bioCard.style.display = "none";

        // Create and setup image with error handling
        const img = document.createElement("img");
        img.src = bio.image || "img/participants/defaultProfilePic.png";
        img.alt = bio.alt || "Default profile photo";
        img.className = "profilePic";
        img.onerror = () => {
          img.src = "img/participants/defaultProfilePic.png";
          console.warn(`Failed to load image for ${bio.id}, using default`);
        };

        const title = document.createElement("p");
        title.className = "bioName";
        title.textContent = bio.title;

        const location = document.createElement("p");
        location.className = "bioLocation";
        location.innerHTML = bio.country;

        const bioCardDetails = document.createElement("div");
        bioCardDetails.className = "bioCardDetails";

        const details = document.createElement("p");
        details.className = "bioText";

        // Only create link if bio.link exists
        if (bio.link) {
          const link = document.createElement("a");
          link.href = bio.link;
          link.textContent = bio.title;
          details.appendChild(link);
        } else {
          // Add name as plain text if no link exists
          const nameText = document.createTextNode(bio.title);
          details.appendChild(nameText);
        }

        let fullDetailsText = ` ${bio.details || "Bio coming soon for this wonderful human"}`;
        if (fullDetailsText.length > 500) {
          const truncatedText = fullDetailsText.slice(0, 500);
          const lastPeriodIndex = truncatedText.lastIndexOf(".");
          const displayText = lastPeriodIndex !== -1 ? truncatedText.slice(0, lastPeriodIndex + 1) : truncatedText;

          details.innerHTML += displayText;

          const readMoreLink = document.createElement("a");
          readMoreLink.href = "#";
          readMoreLink.textContent = "Read more";
          readMoreLink.style.cursor = "pointer";
          readMoreLink.addEventListener("click", function (event) {
            event.preventDefault();
            details.innerHTML = (bio.link ? `<a href="${bio.link}">${bio.title}</a>` : "") + fullDetailsText;
          });

          details.appendChild(document.createTextNode(" "));
          details.appendChild(readMoreLink);
        } else {
          details.innerHTML += fullDetailsText;
        }

        bioCardDetails.appendChild(details);
        bioCard.appendChild(img);
        bioCard.appendChild(title);
        bioCard.appendChild(location);
        if (bio.projects) {
          const projects = document.createElement("p");
          projects.className = "bioProject";
          projects.innerHTML = `<span>game art project(s)</span>: ${bio.projects}`;
          bioCard.appendChild(projects);
        }
        bioCard.appendChild(bioCardDetails);
        bioContainer.appendChild(bioCard);

        // Create participant list entry
        const participantSpan = document.createElement("span");
        participantSpan.className = `participant color-${index % 4}`;

        const participantLink = document.createElement("a");
        participantLink.href = "#";
        participantLink.setAttribute("data-bio-id", bio.id);
        participantLink.textContent = bio.title;

        const countrySpan = document.createElement("span");
        countrySpan.className = "country";
        countrySpan.textContent = ` (${bio.country})`;

        participantSpan.appendChild(participantLink);
        participantSpan.appendChild(countrySpan);
        participantsList.appendChild(participantSpan);

        // Add comma and space if not last item
        if (index < filteredBios.length - 1) {
          const separator = document.createElement("span");
          separator.className = "separator";
          separator.textContent = ", ";
          participantsList.appendChild(separator);
        }
      });

      // Initialize the first bio display if there are any bios
      if (filteredBios.length > 0) {
        let currentBio = 0;
        showBio(currentBio);

        function showBio(index) {
          const bios = document.getElementsByClassName("bioCard");
          if (index >= bios.length) {
            currentBio = 0;
          }
          if (index < 0) {
            currentBio = bios.length - 1;
          }
          for (let i = 0; i < bios.length; i++) {
            bios[i].style.display = "none";
          }
          bios[currentBio].style.display = "flex";
        }

        function changeBio(n) {
          currentBio += n;
          showBio(currentBio);
        }

        function showBioById(bioId) {
          const bios = document.getElementsByClassName("bioCard");
          for (let i = 0; i < bios.length; i++) {
            if (bios[i].id === bioId) {
              currentBio = i;
              showBio(i);
              break;
            }
          }
          const biosSection = document.getElementById("bios");
          if (biosSection) {
            biosSection.scrollIntoView({ behavior: "smooth" });
          }
          history.pushState(null, null, `#bios`);
        }

        // Add event listeners for the bio links
        const links = document.querySelectorAll("a[data-bio-id]");
        links.forEach((link) => {
          link.addEventListener("click", function (event) {
            event.preventDefault();
            const bioId = this.getAttribute("data-bio-id");
            showBioById(bioId);
          });
        });

        // Add event listeners for next and previous bio buttons
        const prevButton = document.querySelector(".prev");
        const nextButton = document.querySelector(".next");

        if (prevButton) {
          prevButton.addEventListener("click", function () {
            changeBio(-1);
          });
        }

        if (nextButton) {
          nextButton.addEventListener("click", function () {
            changeBio(1);
          });
        }
      }
    })
    .catch((error) => console.error("Error fetching bios:", error));
});

// document.addEventListener("DOMContentLoaded", function () {
//   // Get the target year from the script tag's data attribute
//   const scriptTag = document.querySelector('script[src="bioGenerator.js"]');
//   const targetYear = parseInt(scriptTag.getAttribute('data-year'));

//   fetch("bios.json")
//     .then((response) => response.json())
//     .then((bios) => {
//       const bioContainer = document.getElementById("bioContainer");
//       const participantsList = document.getElementById("participantsList");

//       // Filter bios for the specified year only
//       const filteredBios = bios.filter((bio) => bio.years.includes(targetYear));

//       // Sort bios alphabetically by title
//       filteredBios.sort((a, b) => {
//         const nameA = a.title.toUpperCase();
//         const nameB = b.title.toUpperCase();
//         return nameA.localeCompare(nameB);
//       });

//       filteredBios.forEach((bio, index) => {
//         // Create bio card
//         const bioCard = document.createElement("div");
//         bioCard.className = "bioCard";
//         bioCard.id = bio.id;
//         bioCard.style.display = "none";

//         // Create and setup image with error handling
//         const img = document.createElement("img");
//         img.src = bio.image || "img/participants/defaultProfilePic.png";
//         img.alt = bio.alt || "Default profile photo";
//         img.className = "profilePic";
//         img.onerror = () => {
//           img.src = "img/participants/defaultProfilePic.png";
//           console.warn(`Failed to load image for ${bio.id}, using default`);
//         };

//         const title = document.createElement("p");
//         title.className = "bioName";
//         title.textContent = bio.title;

//         const location = document.createElement("p");
//         location.className = "bioLocation";
//         location.innerHTML = bio.country;

//         const bioCardDetails = document.createElement("div");
//         bioCardDetails.className = "bioCardDetails";

//         const details = document.createElement("p");
//         details.className = "bioText";

//         // Only create link if bio.link exists
//         if (bio.link) {
//   const link = document.createElement("a");
//   link.href = bio.link;
//   link.textContent = bio.title;
//   details.appendChild(link);
// } else {
//   // Add name as plain text if no link exists
//   const nameText = document.createTextNode(bio.title);
//   details.appendChild(nameText);
// }

// let fullDetailsText = ` ${bio.details || "Bio coming soon for this wonderful human"}`;
//         if (fullDetailsText.length > 500) {
//           const truncatedText = fullDetailsText.slice(0, 500);
//           const lastPeriodIndex = truncatedText.lastIndexOf(".");
//           const displayText = lastPeriodIndex !== -1 ? truncatedText.slice(0, lastPeriodIndex + 1) : truncatedText;

//           details.innerHTML += displayText;

//           const readMoreLink = document.createElement("a");
//           readMoreLink.href = "#";
//           readMoreLink.textContent = "Read more";
//           readMoreLink.style.cursor = "pointer";
//           readMoreLink.addEventListener("click", function (event) {
//             event.preventDefault();
//             details.innerHTML = (bio.link ? `<a href="${bio.link}">${bio.title}</a>` : "") + fullDetailsText;
//           });

//           details.appendChild(document.createTextNode(" "));
//           details.appendChild(readMoreLink);
//         } else {
//           details.innerHTML += fullDetailsText;
//         }

//         bioCardDetails.appendChild(details);
//         bioCard.appendChild(img);
//         bioCard.appendChild(title);
//         bioCard.appendChild(location);
//         if (bio.projects) {
//           const projects = document.createElement("p");
//           projects.className = "bioProject";
//           projects.innerHTML = `<span>game art project(s)</span>: ${bio.projects}`;
//           bioCard.appendChild(projects);
//         }
//         bioCard.appendChild(bioCardDetails);
//         bioContainer.appendChild(bioCard);

//         // Create participant list entry
//         const participantSpan = document.createElement("span");
//         participantSpan.className = `participant color-${index % 4}`;

//         const participantLink = document.createElement("a");
//         participantLink.href = "#";
//         participantLink.setAttribute("data-bio-id", bio.id);
//         participantLink.textContent = bio.title;

//         const countrySpan = document.createElement("span");
//         countrySpan.className = "country";
//         countrySpan.textContent = ` (${bio.country})`;

//         participantSpan.appendChild(participantLink);
//         participantSpan.appendChild(countrySpan);
//         participantsList.appendChild(participantSpan);

//         // Add comma and space if not last item
//         if (index < filteredBios.length - 1) {
//           const separator = document.createElement("span");
//           separator.className = "separator";
//           separator.textContent = ", ";
//           participantsList.appendChild(separator);
//         }
//       });

//       // Initialize the first bio display if there are any bios
//       if (filteredBios.length > 0) {
//         let currentBio = 0;
//         showBio(currentBio);

//         function showBio(index) {
//           const bios = document.getElementsByClassName("bioCard");
//           if (index >= bios.length) {
//             currentBio = 0;
//           }
//           if (index < 0) {
//             currentBio = bios.length - 1;
//           }
//           for (let i = 0; i < bios.length; i++) {
//             bios[i].style.display = "none";
//           }
//           bios[currentBio].style.display = "flex";
//         }

//         function changeBio(n) {
//           currentBio += n;
//           showBio(currentBio);
//         }

//         function showBioById(bioId) {
//           const bios = document.getElementsByClassName("bioCard");
//           for (let i = 0; i < bios.length; i++) {
//             if (bios[i].id === bioId) {
//               currentBio = i;
//               showBio(i);
//               break;
//             }
//           }
//           const biosSection = document.getElementById("bios");
//           if (biosSection) {
//             biosSection.scrollIntoView({ behavior: "smooth" });
//           }
//           history.pushState(null, null, `#bios`);
//         }

//         // Add event listeners for the bio links
//         const links = document.querySelectorAll("a[data-bio-id]");
//         links.forEach((link) => {
//           link.addEventListener("click", function (event) {
//             event.preventDefault();
//             const bioId = this.getAttribute("data-bio-id");
//             showBioById(bioId);
//           });
//         });

//         // Add event listeners for next and previous bio buttons
//         const prevButton = document.querySelector(".prev");
//         const nextButton = document.querySelector(".next");

//         if (prevButton) {
//           prevButton.addEventListener("click", function () {
//             changeBio(-1);
//           });
//         }

//         if (nextButton) {
//           nextButton.addEventListener("click", function () {
//             changeBio(1);
//           });
//         }
//       }
//     })
//     .catch((error) => console.error("Error fetching bios:", error));
// });