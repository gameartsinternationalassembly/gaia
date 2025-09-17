document.addEventListener("DOMContentLoaded", function () {
  const scriptTag = document.currentScript || document.querySelector('script[src*="scheduleGenerator.js"]');
  const year = scriptTag.getAttribute("data-year");

  if (!year) {
    console.error("No year specified for schedule generator");
    return;
  }

  let biosData = {};
  let locationsData = {};
  let isFirstDay = true;

  // Fetch bios data and then schedule
  fetch("bios.json")
    .then((response) => response.json())
    .then((bios) => {
      biosData = bios.reduce((acc, bio) => {
        if (bio && bio.id) {
          acc[bio.id] = bio;
        }
        return acc;
      }, {});
    })
    .then(() => fetch(`schedule${year}.json`)) // Use dynamic year
    .then((response) => response.json())
    .then((schedule) => {
      const gridContainer = document.querySelector(".grid");
      if (!gridContainer) {
        console.error("Grid container not found");
        return;
      }

      const isOnlineYear = schedule.isOnlineYear || false; // Get the year-level flag
      locationsData = schedule.locations || {}; // Store locations data

      schedule.days.forEach((day) => {
        if (!day.id) {
          console.error("Day missing ID:", day);
          return;
        }

        // Create day container first
        const dayContainer = document.createElement("div");
        dayContainer.className = "grid-item";
        dayContainer.id = day.id;

        // Show first day, hide others
        dayContainer.style.display = isFirstDay ? "block" : "none";
        isFirstDay = false;

        // Add day header
        const dayHeader = document.createElement("h3");
        dayHeader.className = "date";
        dayHeader.textContent = `Day ${day.id.slice(-1)}: ${day.date || "Date TBA"}`;
        dayContainer.appendChild(dayHeader);

        if (Array.isArray(day.sessions)) {
          day.sessions.forEach((session) => {
            // Session title
            const sessionTitle = document.createElement("h5");
            sessionTitle.className = "title";
            sessionTitle.textContent = session.title || "Session Title TBA";
            dayContainer.appendChild(sessionTitle);

            // Add location right after title if available (subtle styling)
            if (session.locationId && locationsData[session.locationId]) {
              const location = locationsData[session.locationId];
              const locationElement = document.createElement("p");
              locationElement.className = "session-location";
              
              if (location.url && location.address) {
                // Location with clickable link
                locationElement.innerHTML = `<a href="${location.url}" target="_blank" rel="noopener noreferrer" class="location-link">${location.name}</a>`;
              } else {
                // Location without link
                locationElement.textContent = location.name;
              }
              dayContainer.appendChild(locationElement);
            }

            // Create session details element
            const sessionDetails = document.createElement("p");
            sessionDetails.className = "details";

            // Time handling with year-level online check
            if (session.time) {
              const timeParts = session.time.split(" - ");
              const startTime = timeParts[0];
              const endTime = timeParts[1];
              const duration = calculateDuration(startTime, endTime);

              if (isOnlineYear) {
                // Online year: show timezone conversion
                const localTime = convertToLocalTime(session.time);
                sessionDetails.innerHTML = `<span>${session.time} CEST // ${localTime} (${duration})</span><br />`;
              } else {
                // In-person year: only show original time and duration
                sessionDetails.innerHTML = `<span>${session.time} (${duration})</span><br />`;
              }
            } else {
              sessionDetails.innerHTML = "<span>Time to be announced</span><br />";
            }

            // Handle participants - only show if there are actual participants
            if (Array.isArray(session.participants) && session.participants.length > 0) {
              // Separate hosts and other participants
              const hosts = [];
              const participants = [];

              session.participants.forEach((participant) => {
                if (!participant || !participant.id) return;

                if (participant.role === "host") {
                  hosts.push(participant);
                } else {
                  participants.push(participant);
                }
              });

              // Add hosts
              if (hosts.length > 0) {
                const hostLabel = hosts.length === 1 ? "Host: " : "Hosts: ";
                sessionDetails.innerHTML += hostLabel;

                hosts.forEach((host, index) => {
                  if (host.id in biosData) {
                    const bio = biosData[host.id];
                    const hostLink = document.createElement("a");
                    hostLink.href = "#bios";
                    hostLink.setAttribute("data-bio-id", host.id);
                    hostLink.textContent = bio.title;
                    sessionDetails.appendChild(hostLink);

                    if (index < hosts.length - 1) {
                      sessionDetails.innerHTML += " + ";
                    }
                  }
                });

                // Add line break if there are hosts
                sessionDetails.innerHTML += "<br />";
              }

              // Add other participants
              if (participants.length > 0) {
                participants.forEach((participant, index) => {
                  if (participant.id in biosData) {
                    const bio = biosData[participant.id];
                    const participantLink = document.createElement("a");
                    participantLink.href = "#bios";
                    participantLink.setAttribute("data-bio-id", participant.id);
                    participantLink.textContent = bio.title;
                    sessionDetails.appendChild(participantLink);

                    if (index < participants.length - 1) {
                      sessionDetails.innerHTML += " + ";
                    }
                  }
                });

                sessionDetails.innerHTML += "<br />";
              }

              // Remove trailing plus sign if exists
              if (sessionDetails.innerHTML.endsWith(" + ")) {
                sessionDetails.innerHTML = sessionDetails.innerHTML.slice(0, -3);
              }
            }

            // Add session description
            sessionDetails.innerHTML += `<br />${session.details || "Session details to be announced"}`;
            
            // Add public access info naturally at the end if relevant
            if (session.publicAccess && session.publicAccess !== "private") {
              const publicAccessText = getPublicAccessText(session.publicAccess);
              if (publicAccessText) {
                if (session.signup && session.signup.url) {
                  // Make it a clickable link
                  sessionDetails.innerHTML += ` <a href="${session.signup.url}" target="_blank" rel="noopener noreferrer" class="signup-link">${publicAccessText}</a>`;
                } else {
                  // Just add the text
                  sessionDetails.innerHTML += ` ${publicAccessText}`;
                }
              }
            }
            
            dayContainer.appendChild(sessionDetails);

            // Add legend placeholder
            const legend = document.createElement("p");
            legend.className = "legend";
            dayContainer.appendChild(legend);
          });
        }

        // Add back to top link
        const backToTop = document.createElement("p");
        backToTop.innerHTML = '<a href="#daySelector">Back to top</a>';
        dayContainer.appendChild(backToTop);

        gridContainer.appendChild(dayContainer);
      });

      // Set up day selection
      const daySelector = document.getElementById("daySelector");
      if (daySelector) {
        daySelector.addEventListener("click", function (e) {
          if (!e.target.matches(".yearbtn")) return;

          // Remove active class from all buttons
          daySelector.querySelectorAll(".yearbtn").forEach((btn) => {
            btn.classList.remove("active");
          });

          // Add active class to clicked button
          e.target.classList.add("active");

          // Hide all day containers
          document.querySelectorAll(".grid-item").forEach((container) => {
            container.style.display = "none";
          });

          // Show selected day
          const selectedDay = e.target.getAttribute("data-day");
          const dayContainer = document.getElementById(selectedDay.toLowerCase());
          if (dayContainer) {
            dayContainer.style.display = "block";
          }
        });

        // Set initial active state
        const firstButton = daySelector.querySelector(".yearbtn");
        if (firstButton) {
          firstButton.classList.add("active");
        }
      }

      // Add bio link handlers
      const links = document.querySelectorAll("[data-bio-id]");
      links.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          const bioId = this.getAttribute("data-bio-id");
          showBioById(bioId);
        });
      });
    })
    .catch((error) => console.error("Error loading schedule:", error));
});

// Get simple text for public access (no badges)
function getPublicAccessText(publicAccess) {
  switch (publicAccess) {
    case "public":
      return "(Registration required for the public. GAIA memmbers are already pre-registered)";
    case "public-registration":
      return "(Registration required for the public. GAIA memmbers are already pre-registered)";
    case "public-registration-required":
      return "(Registration required for both the public and GAIA members)";
    default:
      return null;
  }
}

// Time conversion functions
function calculateDuration(startTime, endTime) {
  try {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startDate = new Date();
    startDate.setHours(startHours, startMinutes);

    const endDate = new Date();
    endDate.setHours(endHours, endMinutes);

    const diffMs = endDate - startDate;
    const diffMins = Math.round(diffMs / 60000);

    return `${diffMins}m`;
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "";
  }
}

function convertToLocalTime(ceTime) {
  try {
    const timeParts = ceTime.split(" - ");
    const startTime = new Date(`1970-01-01T${timeParts[0]}:00+02:00`); // CEST offset is UTC+2
    const endTime = new Date(`1970-01-01T${timeParts[1]}:00+02:00`);

    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
    const timezoneOptions = { timeZoneName: "short" };

    const localStartTime = startTime.toLocaleTimeString([], timeOptions);
    const localEndTime = endTime.toLocaleTimeString([], timeOptions);
    const timezone = startTime.toLocaleTimeString([], timezoneOptions).split(" ").pop() || "local time";

    // Handle the case where the second time is the same as the first time
    if (localStartTime === localEndTime) {
      return `${localStartTime} ${timezone}`;
    }

    // Handle the case where the user is in the same timezone as CEST
    if (timezone === "CEST") {
      return `${ceTime} CEST`;
    }

    // Return the formatted time range with the timezone
    return `${localStartTime} - ${localEndTime} ${timezone}`;
  } catch (error) {
    console.error("Error converting time:", error);
    return ceTime;
  }
}

// Bio display functions
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
  showBio((currentBio += n));
}