# Ink & Echo 🌌👾

**Ink & Echo** is a premium, atmospheric wireframe infinite runner built in **JavaScript** using the **React Native** framework and **Expo**. 

In the deep, pitch-black abyssal ocean, you guide a delicate bioluminescent creature. You are blind to the path ahead—only by emitting tactile **sonar ping waves** can you temporarily reveal the geometry of the obstacles and walls around you. However, noise attracts danger: the echoes will alert lurking predators that will actively chase you. Collect glowing energy orbs to survive, and evolve your creature's capabilities in the shop.

**Gameplay Video**: [Click Here](https://drive.google.com/file/d/1zkBf7vps6bdhAH9rsqv_ULr-qwkShOWL/view?usp=sharing)

---

## 📱 Download & Test the App Instantly

Install the standalone Android application (.APK) directly onto your device: **[Download APK](https://expo.dev/accounts/antonyjacob817/projects/InkAndEcho/builds/36651724-ed9d-4cc9-b1f6-5c9fe9e01ad1)**

<div style="display: flex; align-items: center; gap: 20px; margin-top: 20px;">
  <span>Alternatively, scan the QR code using your mobile device's camera:</span>
  <img src="public/eas-qr-code.png" width="130" alt="Ink & Echo Installation QR Code" />
</div>

---

## 📸 Screenshots
<table align="center">
  <tr>
    <td align="center"><img src="public/Main Menu UI.png" width="350" /><br/><b>Main Menu UI</b></td>
    <td align="center"><img src="public/Options UI.png" width="350" /><br/><b>Options UI</b></td>
  </tr>
  <tr>
    <td align="center"><img src="public/Gameplay UI 1.png" width="350" /><br/><b>Gameplay UI 1</b></td>
    <td align="center"><img src="public/Gameplay UI 2.png" width="350" /><br/><b>Gameplay UI 2</b></td>
  </tr>
  <tr>
    <td align="center"><img src="public/Game Over UI.png" width="350" /><br/><b>Game Over UI</b></td>
    <td align="center"><img src="public/Biomastery Shop UI.png" width="350" /><br/><b>Biomastery Shop UI</b></td>
  </tr>
</table>

---

## 🛠️ Technology Stack
*   **Programming Language**: JavaScript (JS)
*   **Framework**: React Native
*   **Build Tool / Environment**: Expo (using Expo Go for instant testing)

### 📦 Key Libraries & Dependencies
*   `react-native-svg` — Used to render high-performance, scale-independent vector graphics (like the player, obstacles, and active sonar ripples).
*   `expo-font` & `@expo-google-fonts/rubik-glitch` — Used to load the futuristic glitch typography ("JaggedFont") dynamically on startup.
*   `expo-av` — Used to pre-load and play the atmospheric low-frequency drone tracks and sound effects without disk-read lag.
*   `expo-haptics` — Used to trigger tactile physical vibration feedback during damage and upgrade events.

---

## 🚀 How to Run the Project Locally

Follow these step-by-step terminal instructions to get the game running on your mobile device:

### Step 1: Open Your Terminal
Open command prompt (Windows), terminal (Mac/Linux), or VS Code's integrated terminal.

### Step 2: Clone the Repository
Clone the repository using Git and navigate into the project folder:
```bash
git clone https://github.com/antony-jacob817/Ink-and-Echo.git
cd Ink-and-Echo
```

### Step 3: Install Node Packages
Install all required project dependencies (including Expo, React Native, and sound modules):
```bash
npm install
```

### Step 4: Run the Expo Metro Server
Launch the local Expo development server:
```bash
npx expo start
```

### Step 5: Run on Your Mobile Device
1. Download the free **Expo Go** application from the Google Play Store (Android) or Apple App Store (iOS).
2. Connect your mobile phone and computer to the **same Wi-Fi network**.
3. Scan the **QR Code** displayed in your terminal using:
   *   *Android*: The QR scanner inside the Expo Go app.
   *   *iOS*: Your native Camera application (it will prompt you to open Expo Go).
4. The app will bundle and run instantly at a highly-optimized, constant **120 FPS**!

---

## 🎮 Key Features & Gameplay Mechanics

*   **Bioluminescent Sonar Pulse**: Emits expanding tactile sonar rings using an optimized hardware-accelerated rendering pool to visually trace nearby wireframes and highlight paths.
*   **Zero-Lag 120 FPS Rendering**: Built using a flat static object-pool and hardware GPU native driver animation loops to guarantee absolute performance without JS-bridge bottlenecks.
*   **Biomastery Evolution Shop**: Collect glowing orbs during gameplay and spend them in the Shop on three mutation upgrades: *Afterglow Decay*, *Dampened Fins*, and *Pulse Capacity*.
*   **Haptic & Immersive SFX Feedback**: Premium sound design featuring an atmospheric drone track, custom sonar pings, chime collection triggers, and precise physical vibration layers.
