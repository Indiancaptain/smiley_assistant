const canvas = document.getElementById("orbCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
for (let i = 0; i < 220; i++) {
  particles.push({
    angle: Math.random() * Math.PI * 2,
    radius: 90 + Math.random() * 30,
    speed: 0.002 + Math.random() * 0.003
  });
}

function drawOrb() {
  ctx.clearRect(0, 0, 300, 300);
  ctx.save();
  ctx.translate(150, 150);

  ctx.shadowColor = "#f3c969";
  ctx.shadowBlur = 25;

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

function addChat(who, text) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = who === "You" ? "you" : "smiley";
  div.innerText = `${who}: ${text}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function sendToBackend(text) {
  try {
    const res = await fetch("http://127.0.0.1:5000/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    return await res.json();
  } catch {
    return { reply: "Backend not connected,please consult my jafar boss for to build personal assistant like smiley,thank u for opening", mood: "neutral" };
  }
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "en-IN";

document.getElementById("start").onclick = () => recognition.start();

recognition.onresult = async (e) => {
  const text = e.results[0][0].transcript;
  addChat("You", text);

  const res = await sendToBackend(text);
  addChat("Smiley", res.reply);

  speechSynthesis.speak(new SpeechSynthesisUtterance(res.reply));
};


