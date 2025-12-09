(() => {

    // ===== Rotary Dial Mechanics =====
    const dial = document.querySelector(".rotary-dial");
    const numbers = document.querySelectorAll(".number");
    const display = document.querySelector(".phone-display");

    let isDragging = false;
    let startAngle = 0;
    let currentAngle = 0;
    let dialedNumbers = [];
    const MAX_ROTATION = 220; // metal stop angle
    const santaCode = ["7", "2", "6", "8", "2"]; // SANTA
    let talkingToSanta=false
    let speaking = false

    // Get angle from mouse/touch position
    function getAngle(event) {
        const rect = dial.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const x = (event.touches ? event.touches[0].clientX : event.clientX) - cx;
        const y = (event.touches ? event.touches[0].clientY : event.clientY) - cy;
        return Math.atan2(y, x) * (180 / Math.PI);
    }

    // === Start dragging only if finger is in a hole ===
    function startDrag(e) {
        const numberHole = e.target.closest(".number");
        if (!numberHole) return;

        e.preventDefault();
        isDragging = true;

        // Store which digit was selected
        dial.dataset.num = numberHole.dataset.num;

        // Disable snap-back animation during drag
        dial.style.transition = "none";
        startAngle = getAngle(e);

        window.addEventListener("mousemove", onDrag);
        window.addEventListener("touchmove", onDrag);
        window.addEventListener("mouseup", endDrag);
        window.addEventListener("touchend", endDrag);
    }

    // === Drag only clockwise until stop ===
    function onDrag(e) {
        if (!isDragging) return;

        const angle = getAngle(e);
        let diff = angle - startAngle;

        // Normalize to positive rotation
        if (diff < 0) diff += 360;

        // Limit rotation to physical stop
        if (diff > 0 && diff < MAX_ROTATION) {
            currentAngle = diff;
            dial.style.transform = `rotate(${currentAngle}deg)`;
        }
    }

    // === Release dial — realistic snap-back ===
    function endDrag() {
        if (!isDragging) return;
        isDragging = false;

        // Snap-back animation (like real rotary spring mechanism)
        dial.style.transition = "transform 0.6s cubic-bezier(0.3, 0, 0.3, 1)";
        dial.style.transform = "rotate(0deg)";

        const num = dial.dataset.num;
        dialedNumbers.push(num);
        display.textContent = dialedNumbers.join(" ");

        checkSantaCode();

        if (dialedNumbers.length > santaCode.length) {
            dialedNumbers = dialedNumbers.slice(-santaCode.length);
        }
    }

    function startSantaVoiceCall() {
        if (talkingToSanta) return;
        talkingToSanta = true;
        display.textContent = "📞 Connecting to Santa...";

        setTimeout(() => {
            display.textContent = "🎅 Santa is listening...";

            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            recognition.continuous = true;

            let santaMsg = ""
            const santaSpeak = (msg) => {
                if (speaking) {santaMsg = msg; return};
                santaMsg = ""
                const u = new SpeechSynthesisUtterance(msg);

                // Make the voice deeper and jolly
                u.pitch = 0.4;       // low = deep & Santa-like
                u.rate = 0.9;        // slightly slower for warm tone
                u.volume = 1.0;

                // Pick a male/deep voice if possible
                const voices = speechSynthesis.getVoices();
                u.voice = voices.find(v => /male|Alex|Daniel|Fred|Google US English/i.test(v.name)) 
                        || voices.find(v => v.lang === "en-US") 
                        || voices[0];

                u.onend = () => { speaking = false; if (santaMsg) santaSpeak(santaMsg);} 
                
                speaking = true
                speechSynthesis.speak(u);
                setTimeout(()=>{display.textContent = "🎅 Santa: " + msg;}, 1000)
            };

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                display.textContent = "🗣 You: " + transcript;

                if (transcript.includes("hello") || transcript.includes("hi")) {
                    santaSpeak("Ho Ho Ho! Hello there!");
                }
                else if (transcript.includes("christmas")) {
                    santaSpeak("Christmas is my favorite time of the year!");
                }
                else if (transcript.includes("present")) {
                    santaSpeak("Tell me what present you wish for this Christmas!");
                }
                else if (transcript.includes("want")) {
                    santaSpeak("Maybe, if you stay on the nice list, this year!");
                }
                else {
                    santaSpeak("Ho Ho Ho! I’m not sure I heard that. Can you repeat?");
                }
            };

            recognition.start();

            santaSpeak("Ho Ho Ho! This is Santa Claus speaking! What do you want for Christmas?");
        }, 1500);
    }



    // === Check for SANTA ===
    function checkSantaCode() {
        const input = dialedNumbers.slice(-santaCode.length).join("");
        const santa = santaCode.join("");

        if (input === santa) {
            startSantaVoiceCall()
        }

        if (dialedNumbers.join("") === "000000") {
            document.getElementsByClassName("eject-btn")[0].click()
        }
    }

    // event listeners
    dial.addEventListener("mousedown", startDrag);
    dial.addEventListener("touchstart", startDrag);

})();
