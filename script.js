/*********************************
 * CANVAS + PARTICLES
 *********************************/
const canvas = document.getElementById("orbCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

let particles = [];

for (let i = 0; i < 260; i++) {
  particles.push({
    angle: Math.random() * Math.PI * 2,
    radius: 90 + Math.random() * 25,
    speed: 0.002 + Math.random() * 0.004
  });
}

/*********************************
 * MIC AUDIO (ORB REACTION)
 *********************************/
let audioCtx, analyser, micStream;
let audioData = new Uint8Array(128);

async function startMic() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const source = audioCtx.createMediaStreamSource(micStream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
}

function stopMic() {
  if (micStream) {
    micStream.getTracks().forEach(t => t.stop());
    micStream = null;
  }
}

function readMicLevel() {
  if (!analyser) return 0;

  analyser.getByteTimeDomainData(audioData);
  let sum = 0;

  for (let i = 0; i < audioData.length; i++) {
    const v = (audioData[i] - 128) / 128;
    sum += v * v;
  }

  return Math.sqrt(sum / audioData.length);
}

/*********************************
 * ORB DRAW LOOP
 *********************************/
function drawOrb() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  const level = readMicLevel();
  const speedBoost = 1 + level * 14;
  const pulse = level * 45;
  const glow = 25 + level * 130;

  ctx.shadowColor = "#f3c969";
  ctx.shadowBlur = glow;

  particles.forEach(p => {
    p.angle += p.speed * speedBoost;
    const r = p.radius + pulse;
    const x = Math.cos(p.angle) * r;
    const y = Math.sin(p.angle) * r;
    ctx.fillStyle = "#f3c969";
    ctx.fillRect(x, y, 2, 2);
  });

  ctx.restore();
  requestAnimationFrame(drawOrb);
}
drawOrb();

/*********************************
 * BACKEND COMMUNICATION (FIXED)
 *********************************/
async function sendCommandToBackend(text) {
  const res = await fetch("http://127.0.0.1:5000/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  return await res.json();
}

/*********************************
 * CHAT MEMORY
 *********************************/
function addChat(who, text) {
  const chat = document.getElementById("chat");

  const msg = document.createElement("div");
  msg.className = who === "You" ? "you" : "smiley";
  msg.innerText = `${who}: ${text}`;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

/*********************************
 * SPEECH RECOGNITION
 *********************************/
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-IN";
recognition.continuous = false;
recognition.interimResults = false;

let mode = "idle";

/*********************************
 * LISTEN → BACKEND → SPEAK
 *********************************/
function listenAndSend() {
  recognition.start();

  recognition.onstart = () => {
    mode = "listening";
  };

  recognition.onresult = async (event) => {
    const text = event.results[0][0].transcript;
    addChat("You", text);

    mode = "thinking";

    try {
      const response = await sendCommandToBackend(text);

      addChat("Smiley", response.reply);
      speakText(response.reply);

      if (response.mood) {
        setMood(response.mood);
      }
    } catch (e) {
      addChat("Smiley", "Backend not responding boss");
    }
  };

  recognition.onerror = () => {
    mode = "idle";
  };
}

/*********************************
 * TEXT TO SPEECH
 *********************************/
function speakText(text) {
  mode = "speaking";

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";

  utter.onend = () => {
    mode = "idle";
  };

  speechSynthesis.speak(utter);
}

/*********************************
 * START / STOP BUTTONS
 *********************************/
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");

startBtn.onclick = async () => {
  startBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");

  await startMic();
  listenAndSend();
};

stopBtn.onclick = () => {
  stopBtn.classList.add("hidden");
  startBtn.classList.remove("hidden");

  stopMic();
  recognition.stop();
  speechSynthesis.cancel();
  mode = "idle";
};

/*********************************
 * CAMERA PREVIEW
 *********************************/
const camBtn = document.getElementById("camBtn");
const video = document.getElementById("camera");

let camOn = false;
let camStream = null;

camBtn.onclick = async () => {
  if (!camOn) {
    camStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = camStream;
    video.onloadedmetadata = () => video.play();
    camBtn.innerText = "❌ Stop";
    camOn = true;
  } else {
    camStream.getTracks().forEach(t => t.stop());
    video.srcObject = null;
    camBtn.innerText = "📷 Camera";
    camOn = false;
  }
};

/*********************************
 * MOOD HANDLER (READY FOR UI)
 *********************************/
function setMood(mood) {
  console.log("Smiley mood:", mood);

  // Future upgrade:
  // happy → yellow glow
  // thinking → blue
  // neutral → soft white
}
