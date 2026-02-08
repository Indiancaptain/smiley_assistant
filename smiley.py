import speech_recognition as sr
import pyttsx3
import datetime
import os
import subprocess
import time
import psutil
import pyautogui
import pyperclip
import pygetwindow as gw
import cv2
from openai import OpenAI

# ================= CONFIG =================
pyautogui.FAILSAFE = False
AUTO_REPLY = False

# ================= GROQ CLIENT =================
client = OpenAI(base_url="https://api.groq.com/openai/v1")

# ================= SPEAK =================
def speak(text):
    print("Smiley:", text)
    engine = pyttsx3.init("sapi5")
    engine.setProperty("rate", 165)
    engine.setProperty("volume", 1.0)
    voices = engine.getProperty("voices")
    engine.setProperty("voice", voices[1].id)
    engine.say(text)
    engine.runAndWait()
    engine.stop()

def speak_long(text, chunk=120):
    for i in range(0, len(text), chunk):
        speak(text[i:i + chunk])

# ================= LISTEN =================
def listen():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source, 0.6)
        audio = r.listen(source)
    try:
        q = r.recognize_google(audio, language="en-in")
        print("You:", q)
        return q.lower()
    except:
        return ""

# ================= AI =================
def ai(prompt):
    res = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are Smiley, a friendly assistant. Call the user Jafar boss."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )
    return res.choices[0].message.content

# ================= APPS =================
APPS = {
    "chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "notepad": "notepad",
    "calculator": "calc",
    "vscode": r"C:\Users\APPLE\AppData\Local\Programs\Microsoft VS Code\Code.exe",
}

def open_app(name):
    if name in APPS:
        speak(f"Opening {name} boss")
        subprocess.Popen(APPS[name])
    else:
        speak("I don't know that app boss")

def close_app(name):
    for proc in psutil.process_iter(["name"]):
        try:
            if name.lower() in proc.info["name"].lower():
                proc.kill()
                speak(f"{name} closed boss")
                return
        except:
            pass
    speak("That app is not running boss")

# ================= SEARCH =================
def search_in_app(text):
    speak(f"Searching {text}")
    pyautogui.hotkey("ctrl", "f")
    time.sleep(0.6)
    pyautogui.write(text, interval=0.05)
    pyautogui.press("enter")

# ================= MOUSE =================
def mouse_control(cmd):
    if "move left" in cmd:
        pyautogui.moveRel(-200, 0, 0.3); speak("Mouse left"); return True
    if "move right" in cmd:
        pyautogui.moveRel(200, 0, 0.3); speak("Mouse right"); return True
    if "move up" in cmd:
        pyautogui.moveRel(0, -200, 0.3); speak("Mouse up"); return True
    if "move down" in cmd:
        pyautogui.moveRel(0, 200, 0.3); speak("Mouse down"); return True
    if "click" in cmd:
        pyautogui.click(); speak("Clicked"); return True
    if "double click" in cmd:
        pyautogui.doubleClick(); speak("Double clicked"); return True
    if "right click" in cmd:
        pyautogui.rightClick(); speak("Right clicked"); return True
    if "scroll up" in cmd:
        pyautogui.scroll(500); speak("Scrolling up"); return True
    if "scroll down" in cmd:
        pyautogui.scroll(-500); speak("Scrolling down"); return True
    return False

# ================= SCREEN =================
def read_screen():
    try:
        win = gw.getActiveWindow()
        if win:
            speak(f"You are in {win.title}")
        else:
            speak("No active window detected")
    except:
        speak("Unable to read screen boss")

def read_clipboard():
    text = pyperclip.paste()
    if text.strip():
        speak_long(text)
    else:
        speak("Clipboard is empty boss")

# ================= WHATSAPP =================
def send_whatsapp_by_name(contact, message):
    speak(f"Sending message to {contact}")
    os.system("start https://web.whatsapp.com")
    time.sleep(15)
    pyautogui.hotkey("ctrl", "alt", "/")
    time.sleep(1)
    pyautogui.write(contact, interval=0.08)
    pyautogui.press("enter")
    time.sleep(1)
    pyautogui.write(message, interval=0.05)
    pyautogui.press("enter")
    speak("Message sent boss")

def read_selected_message():
    text = pyperclip.paste()
    if text.strip():
        speak("Message says")
        speak_long(text)
        return text
    speak("No message selected boss")
    return ""

def auto_reply(msg):
    reply = ai(f"Reply politely to this WhatsApp message: {msg}")
    pyautogui.write(reply, interval=0.04)
    pyautogui.press("enter")
    speak("Reply sent boss")

# ================= CAMERA =================
def scan_object():
    speak("Opening camera boss. Press C to capture, Q to exit.")
    cam = cv2.VideoCapture(0)

    if not cam.isOpened():
        speak("Camera not accessible boss")
        return

    while True:
        ret, frame = cam.read()
        if not ret:
            continue

        cv2.imshow("Smiley Camera", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord("c"):
            img = os.path.abspath("object.jpg")
            cv2.imwrite(img, frame)
            cam.release()
            cv2.destroyAllWindows()
            speak("Image captured boss. Opening Google Lens.")
            os.system("start https://lens.google.com/upload")
            time.sleep(6)
            os.startfile(os.path.dirname(img))
            return

        if key == ord("q"):
            break

    cam.release()
    cv2.destroyAllWindows()

# ================= WISH =================
def wish():
    h = datetime.datetime.now().hour
    speak("Good morning Jafar boss" if h < 12 else "Good evening Jafar boss")
    speak("Say hey smiley to wake me up")

# ================= MAIN =================
if __name__ == "__main__":
    wish()

    while True:
        cmd = listen()

        if "hey smiley" not in cmd:
            continue

        speak("Yes boss")
        q = listen()

        if not q:
            continue

        # AUTO REPLY PRIORITY
        if AUTO_REPLY and "reply now" in q:
            msg = read_selected_message()
            if msg:
                auto_reply(msg)
            else:
                speak("No message copied boss")
            continue

        if mouse_control(q):
            continue

        if q.startswith("open"):
            open_app(q.replace("open", "").strip())
            continue

        if q.startswith("close"):
            close_app(q.replace("close", "").strip())
            continue

        if "search" in q:
            speak("What should I search boss?")
            search_in_app(listen())
            continue

        if "read screen" in q:
            read_screen()
            continue

        if "read clipboard" in q:
            read_clipboard()
            continue

        if "send whatsapp" in q or "send message" in q:
            speak("Whom should I message boss?")
            name = listen()
            speak("What is the message?")
            msg = listen()
            send_whatsapp_by_name(name, msg)
            continue

        if "read whatsapp" in q:
            read_selected_message()
            continue

        if "enable auto reply" in q:
            AUTO_REPLY = True
            speak("Auto reply enabled")
            continue

        if "disable auto reply" in q:
            AUTO_REPLY = False
            speak("Auto reply disabled")
            continue

        if "scan object" in q:
            scan_object()
            continue

        if "bye" in q or "sleep" in q:
            speak("Goodbye boss")
            break

        speak("Thinking boss")
        speak_long(ai(q))
def handle_command(command: str):
    if not command:
        return "I didn't hear anything boss.", "neutral"

    reply = ai(command)

    mood = "thinking"
    if "good" in reply.lower():
        mood = "happy"

    return reply, mood
