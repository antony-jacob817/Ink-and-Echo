# Ink & Echo 🌌👾

**Ink & Echo** is a premium, atmospheric wireframe infinite runner built in **JavaScript** using the **React Native** framework and **Expo**. 

In the deep, pitch-black abyssal ocean, you guide a delicate bioluminescent creature. You are blind to the path ahead—only by emitting tactile **sonar ping waves** can you temporarily reveal the geometry of the obstacles and walls around you. However, noise attracts danger: the echoes will alert lurking predators that will actively chase you. Collect glowing energy orbs to survive, and evolve your creature's capabilities in the shop.

---

## 📸 Screenshots

| | |
| <img src="public/Main Menu UI.png" width="380" /> <br> **Main Menu UI.png** | <img src="public/Options UI.png" width="380" /> <br> **Options UI.png** |
| <img src="public/Gameplay UI 1.png" width="380" /> <br> **Gameplay UI 1.png** | <img src="public/Gameplay UI 2.png" width="380" /> <br> **Gameplay UI 2.png** |
| <img src="public/Game Over UI.png" width="380" /> <br> **Game Over UI.png** | <img src="public/Biomastery Shop UI.png" width="380" /> <br> **Biomastery Shop UI.png** |

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
*   `eas-cli` (`npm install --global eas-cli`) — Used to configure (`eas build:configure`) and trigger cloud APK/AAB builds for release testing.

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

## 📹 Submission Materials
*   **GitHub Repository**: [Ink & Echo Codebase](https://github.com/antony-jacob817/Ink-and-Echo.git)
*   **Screen Recording Link**: *[INSERT YOUR GOOGLE DRIVE OR YOUTUBE UNLISTED VIDEO LINK HERE]*

---

## 🎮 Key Features & Gameplay Mechanics

*   **Bioluminescent Sonar Pulse**: Emits expanding tactile sonar rings using an optimized hardware-accelerated rendering pool to visually trace nearby wireframes and highlight paths.
*   **Zero-Lag 120 FPS Rendering**: Built using a flat static object-pool and hardware GPU native driver animation loops to guarantee absolute performance without JS-bridge bottlenecks.
*   **Biomastery Evolution Shop**: Collect glowing orbs during gameplay and spend them in the Shop on three mutation upgrades: *Afterglow Decay*, *Dampened Fins*, and *Pulse Capacity*.
*   **Haptic & Immersive SFX Feedback**: Premium sound design featuring an atmospheric drone track, custom sonar pings, chime collection triggers, and precise physical vibration layers.
