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
    showBio(currentBio += n);
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
