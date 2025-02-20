let currentBio = 0;

document.addEventListener("DOMContentLoaded", function () {
  fetch("bios.json")
    .then((response) => response.json())
    .then((bios) => {
      const bioContainer = document.getElementById("bioContainer");
      const participantsList = document.getElementById("participantsList"); // Ensure you have an element with this ID in your HTML
      const currentYear = 2024;

      const filteredBios = bios.filter((bio) => bio.years.includes(currentYear));

      filteredBios.sort((a, b) => {
        const nameA = a.title.toUpperCase();
        const nameB = b.title.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      filteredBios.forEach((bio, index) => {
        // Create bio card
        const bioCard = document.createElement("div");
        bioCard.className = "bioCard";
        bioCard.id = bio.id;
        bioCard.style.display = "none";

        const img = document.createElement("img");
        const baseImagePath = `img/participants/${bio.id}`;
        const imageExtensions = ["png", "jpg", "jpeg"];
        img.alt = bio.alt || "Default profile photo";
        img.className = "profilePic";

        // Check which image file exists and set the img src
        let imageFound = false;
        for (const ext of imageExtensions) {
          const imagePath = `${baseImagePath}.${ext}`;
          const xhr = new XMLHttpRequest();
          xhr.open("HEAD", imagePath, false);
          xhr.send();

          if (xhr.status !== 404) {
            img.src = imagePath;
            imageFound = true;
            break;
          }
        }

        // If no image is found, set a default image or handle it accordingly
        if (!imageFound) {
          img.src = "img/participants/defaultProfilePic.png"; // Set your default image path here
        }

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

        const link = document.createElement("a");
        link.href = bio.link;
        link.textContent = bio.title;
        details.appendChild(link);

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
            details.innerHTML = link.outerHTML + fullDetailsText;
          });

          // Append a plain space and then the read more link
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
        // Replace the participant list creation part with:
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

    
      // Initialize the first bio display
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
        // Scroll to the #bios section
        const biosSection = document.getElementById("bios");
        if (biosSection) {
          biosSection.scrollIntoView({ behavior: "smooth" });
        }
        // Update the URL hash without jumping
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
    })
    .catch((error) => console.error("Error fetching bios:", error));
});
