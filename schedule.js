document.addEventListener('DOMContentLoaded', function() {
    let biosData = {};
  
    // Fetch bios data
    fetch('bios.json')
      .then(response => response.json())
      .then(bios => {
        biosData = bios.reduce((acc, bio) => {
          acc[bio.id] = bio;
          return acc;
        }, {});
      })
      .then(() => {
        // Fetch schedule data after bios data is loaded
        return fetch('schedule.json');
      })
      .then(response => response.json())
      .then(schedule => {
        const gridContainer = document.querySelector('.grid');
  
        schedule.days.forEach(day => {
          const dayContainer = document.createElement('div');
          dayContainer.className = 'grid-item';
          dayContainer.id = day.id;
  
          const dayHeader = document.createElement('h3');
          dayHeader.className = 'date';
          dayHeader.textContent = `Day ${day.id.slice(-1)}: ${day.date}`;
          dayContainer.appendChild(dayHeader);
  
          const registration = document.createElement('h4');
          registration.className = 'location-program';
          registration.innerHTML = '<span aria-hidden="true">&#x1f4cd;</span><a href="https://forms.gle/29P25sAUAEZ9MAti8">Registration Form</a>';
          dayContainer.appendChild(registration);
  
          day.sessions.forEach(session => {
            const sessionTitle = document.createElement('h5');
            sessionTitle.className = 'title';
            sessionTitle.textContent = session.title;
            dayContainer.appendChild(sessionTitle);
  
            const sessionDetails = document.createElement('p');
            sessionDetails.className = 'details';
  
            const timeParts = session.time.split(' - ');
            const startTime = timeParts[0];
            const endTime = timeParts[1];
            const duration = calculateDuration(startTime, endTime);
  
            sessionDetails.innerHTML = `<span>${session.time} (${duration})</span><br />`;
  
            session.participants.forEach((participant, index) => {
              if (participant.id in biosData) {
                const bio = biosData[participant.id];
                const participantLink = document.createElement('a');
                participantLink.href = '#bios';
                participantLink.setAttribute('data-bio-id', participant.id);
                participantLink.textContent = bio.title;
  
                sessionDetails.appendChild(participantLink);
  
                if (index < session.participants.length - 1) {
                  sessionDetails.innerHTML += ' + ';
                }
              }
            });
  
            sessionDetails.innerHTML += `<br />${session.details}`;
            dayContainer.appendChild(sessionDetails);
  
            const legend = document.createElement('p');
            legend.className = 'legend';
            dayContainer.appendChild(legend);
          });
  
          const backToTop = document.createElement('p');
          backToTop.innerHTML = '<a href="#daySelector">Back to top</a>';
          dayContainer.appendChild(backToTop);
  
          gridContainer.appendChild(dayContainer);
        });
  
        // Add click event listeners to participant links
        const links = document.querySelectorAll('[data-bio-id]');
        links.forEach(link => {
          link.addEventListener('click', function(event) {
            event.preventDefault();
            const bioId = this.getAttribute('data-bio-id');
            showBioById(bioId);
          });
        });
      })
      .catch(error => console.error('Error fetching schedule:', error));
  });
  
  // Function to calculate the duration between two times in HH:mm format
  function calculateDuration(startTime, endTime) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
  
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes);
  
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes);
  
    const diffMs = endDate - startDate;
    const diffMins = Math.round(diffMs / 60000);
  
    return `${diffMins}m`;
  }
  
  // Function to show bio by ID
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
    const biosSection = document.getElementById('bios');
    if (biosSection) {
      biosSection.scrollIntoView({ behavior: 'smooth' });
    }
    // Update the URL hash without jumping
    history.pushState(null, null, `#bios`);
  }
  
  // Function to show bio by index
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
  
  // Function to change bio by n
  function changeBio(n) {
    showBio(currentBio += n);
  }
  
  // Function to get a random bio index
  function getRandomBioIndex() {
    const bios = document.getElementsByClassName("bioCard");
    return Math.floor(Math.random() * bios.length);
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('a[data-bio-id]');
    links.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const bioId = this.getAttribute('data-bio-id');
        showBioById(bioId);
      });
    });
  });
  