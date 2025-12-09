const tapes = document.querySelectorAll(".vhs");
const screen = document.getElementById("screen");
const ejectBtn = document.querySelector(".eject-btn");
const elfPopup = document.getElementById("elf-popup");

let currentTape = null; // track tape in player

function showElf(message) {
    elfPopup.textContent = message;
    elfPopup.classList.add("show");
    setTimeout(() => {
        elfPopup.classList.remove("show");
    }, 3000);
}

tapes.forEach(tape => {
    tape.addEventListener("click", () => {
        if (currentTape) {
            showElf("📢 You need to eject the current VHS!");
            return;
        }

        currentTape = tape;

        // clone and animate
        const clone = tape.cloneNode(true);
        document.body.appendChild(clone);
        clone.classList.add("clone");

        // hide tape on shelf
        tape.style.visibility = "hidden";

        showElf(`🎄 You inserted "${tape.querySelector('.vhs-label').textContent}"!`);

        setTimeout(() => {
            clone.remove();
            screen.textContent = "🔄 Loading Tape...";

            setTimeout(() => {
                const contentFile = tape.dataset.content; // e.g., "home.html" containing a <div>

                fetch(`pages/${contentFile}.html`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Tape missing! Path: ${contentFile} | Status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(html => {
                        // Inject the content div into the TV screen
                        screen.innerHTML = html;


                        // manually execute scripts
                        const scripts = screen.querySelectorAll("script");
                        scripts.forEach(oldScript => {
                            try {
                                const newScript = document.createElement("script");
                                if (oldScript.src) {
                                    newScript.src = oldScript.src; // external script
                                } else {
                                    newScript.textContent = oldScript.textContent; // inline script
                                }

                                document.body.appendChild(newScript);
                                newScript.onload = () => newScript.remove(); // remove after loaded (for external)
                                if (!oldScript.src) newScript.remove();       // remove immediately if inline
                            }
                            catch(e) {
                                console.log(e);
                            }
                        });

                    })
                    .catch(err => {
                        screen.textContent = "❌ Failed to load tape!";
                        console.error(err);
                    });

            }, 1000);
        }, 1600);
    });
});


ejectBtn.addEventListener("click", () => {
    screen.textContent = "📼 Insert a VHS Tape...";
    if (currentTape) {
        currentTape.style.visibility = "visible";
        currentTape = null;
        if (getActiveEvent()) unloadEvent(getActiveEvent());
        showElf("📤 Tape ejected!");
    }
});


function getActiveEvent() {
    const el = document.querySelector("[data-event]");
    return el ? el.dataset.event : null;
}

/**
 * Dynamically load an event from /events/<eventName>/
 * Loads: index.html, style.css, index.js
 */
async function loadEvent(eventName) {
  if (!eventName) return console.error("❌ No event name provided.");
  if (document.querySelector(`[data-event='${eventName}']`)) {
    console.log(`Event '${eventName}' already active.`);
    return;
  }

  const basePath = `events/${eventName}/`;

  try {
    // Load HTML
    const html = await fetch(`${basePath}index.html`).then(r => {
      if (!r.ok) throw new Error(`Missing HTML for ${eventName}`);
      return r.text();
    });
    document.body.insertAdjacentHTML("beforeend", html);
    const rootEl = document.body.lastElementChild;
    rootEl.setAttribute("data-event", eventName);

    // Load CSS
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = `${basePath}style.css`;
    style.dataset.event = eventName;
    document.head.appendChild(style);

    // Load JS
    const script = document.createElement("script");
    script.src = `${basePath}index.js`;
    script.dataset.event = eventName;
    document.body.appendChild(script);

    console.log(`✅ Event '${eventName}' loaded.`);
  } catch (err) {
    console.error(`❌ Failed to load event '${eventName}':`, err);
  }
}

/**
 * Unload event and its linked assets.
 */
function unloadEvent(eventName) {
  if (!eventName) return;
  document.querySelectorAll(`[data-event='${eventName}']`).forEach(element => element.remove());
  console.log(`🧹 Event '${eventName}' unloaded.`);
}


/* 
* Play Effect
*/
function playEffect(effectName) {
    if (!effectName) return;
    new Audio(`audio/${effectName}.mp3`).play();
}