/*********************************
 * CANVAS ORB
 *********************************/
const canvas = document.getElementById("orbCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

let particles = [];

for (let i = 0; i < 220; i++) {
  particles.push({
    angle: Math.random() * Math.PI * 2,
    radius: 90 + Math.random() * 30,
    speed: 0.002 + Math.random() * 0.003
  });
}

function drawOrb() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(150, 150);

  ctx.shadowColor = "#f3c969";
  ctx.shadowBlur = 30;

  particles.forEach(p => {
    p.angle += p.speed;
    const x = Math.cos(p.angle) * p.radius;
    const y = Math.sin(p.angle) * p.radius;
    ctx.fillStyle = "#f3c969";
    ctx.fillRect(x, y, 2, 2);
  });

  ctx.restore();
  requestAnimationFrame(drawOrb);
}
drawOrb();

/*********************************
 * CHAT UI
 *********************************/
function addChat(who, text) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = who === "You" ? "you" : "smiley";
  div.innerText = `${who}: ${text}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/*********************************
 * MOCK AI (GITHUB SAFE)
 *********************************/
function fakeAIResponse(text) {
  const replies = [
    "Got it boss 😎",
    "Working on it 🚀",
    "I hear you loud and clear 🔊",
    "Command received 💡"
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

/*********************************
 * SPEECH RECOGNITION
 *********************************/
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-IN";

document.getElementById("start").onclick = () => {
  recognition.start();
};

recognition.onresult = (e) => {
  const text = e.results[0][0].transcript;
  addChat("You", text);

  const reply = fakeAIResponse(text);
  addChat("Smiley", reply);

  speechSynthesis.speak(
    new SpeechSynthesisUtterance(reply)
  );
};

/*********************************
 * CAMERA
 *********************************/
const camBtn = document.getElementById("camBtn");
const video = document.getElementById("camera");
let camStream = null;

camBtn.onclick = async () => {
  if (!camStream) {
    camStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = camStream;
    camBtn.innerText = "❌ Stop";
  } else {
    camStream.getTracks().forEach(t => t.stop());
    camStream = null;
    video.srcObject = null;
    camBtn.innerText = "📷 Camera";
  }
};

