const tapes = document.querySelectorAll(".vhs");
const screen = document.getElementById("screen");

tapes.forEach(tape => {
  tape.addEventListener("click", () => {
    // VHS insert animation
    const clone = tape.cloneNode(true);
    document.body.appendChild(clone);
    clone.classList.add("clone");

    setTimeout(() => {
      clone.remove();

      // Fetch the page content
      const pageFile = tape.dataset.page;
      fetch(pageFile)
        .then(res => res.text())
        .then(html => {
          screen.innerHTML = html;
        })
        .catch(err => {
          screen.innerHTML = "❌ Failed to load page.";
          console.error(err);
        });
    }, 1600); // match animation duration
  });
});

// Eject button clears screen
const ejectBtn = document.querySelector(".eject-btn");
ejectBtn.addEventListener("click", () => {
  screen.innerHTML = "📼 Insert a VHS Tape...";
});
