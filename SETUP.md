# WiseTrips — Local Development Setup

This guide walks you through getting **WiseTrips** running on your computer so you can start developing. WiseTrips uses **React Native / Expo** for the mobile app and **Python / FastAPI** for the backend.

**WiseTrips is iOS-first, but you can develop and test the shared React Native app using either an iPhone or an Android phone.** You do **not** need an iPhone or a Mac to contribute.

## 1. Install the required tools

Install these on your **computer** (Windows or macOS):

| Tool | What it's for | Download |
| --- | --- | --- |
| **Git** | Downloading the repository | [Download Git](https://git-scm.com/downloads) |
| **Node.js (LTS)** | Running the Expo frontend (includes npm) | [Download Node.js](https://nodejs.org/en/download) |
| **uv** | Managing Python and installing backend dependencies | [Install uv](https://docs.astral.sh/uv/getting-started/installation/) |
| **VS Code** (recommended) **or another code editor** | Editing the frontend and backend code | [Download VS Code](https://code.visualstudio.com/download) |

**Mac users:** You can also install **[Xcode](https://developer.apple.com/xcode/)** if you prefer using it for Apple/iOS development or want to run the iOS Simulator. **VS Code is recommended for editing WiseTrips’ React Native/TypeScript and Python files, but it isn’t mandatory.** Xcode is optional, and it is available only on macOS.

After installing everything, restart your terminal and confirm these commands work:

```bash
git --version
node --version
npm --version
uv --version
```

## 2. Choose how to run the mobile app

You only need **one** of the following ways to view and test WiseTrips.

### Windows computer

**Recommended: Use Expo Go on your phone.**

1. Install **Expo Go on your phone**, **not on your Windows computer**:
   - **Android:** Download it from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
   - **iPhone:** See [Expo Go for iOS](https://expo.dev/go) for the version and installation options compatible with our project.
2. If you plan to use Expo Go, create a free [Expo account](https://expo.dev/signup) and sign in to that account **inside the Expo Go app on your phone**.
3. Connect your phone and Windows computer to the **same Wi-Fi network**.
4. In Step 5, you'll sign in to the **same Expo account in your terminal**, start Expo, and scan its QR code with your phone.

### Mac computer

Choose whichever is easier:

- **Physical phone:** Install **Expo Go** on an Android phone or compatible iPhone, create a free [Expo account](https://expo.dev/signup), and sign in to that account **in the Expo Go app**. Connect the phone and Mac to the same Wi-Fi network. You'll also sign in through your terminal in Step 5.
- **iOS Simulator (no iPhone required):** Install [Xcode](https://developer.apple.com/xcode/) from the Mac App Store. Open **Xcode → Settings → Locations** to configure Command Line Tools, then **Settings → Components** to download an iOS Simulator runtime if needed.

**Editor choice:** You can use **VS Code (recommended)** to edit WiseTrips, or use **Xcode if you prefer working in Apple’s IDE**. Xcode is particularly useful for the **iOS Simulator and native iOS development**. Because most WiseTrips code is React Native/TypeScript and Python, VS Code offers a more convenient editing experience. Either way, you still run the Expo and FastAPI commands in the terminal.

## 3. Clone WiseTrips

Open a terminal (PowerShell on Windows or Terminal on macOS):

```bash
git clone https://github.com/OWNER_OR_ORG/WiseTrips.git
cd WiseTrips
```

Replace `OWNER_OR_ORG` with the actual GitHub username or organization. Open the **WiseTrips** folder in VS Code or your preferred editor. On a Mac, you may use Xcode for iOS-related development if you prefer; the commands below remain the same.

## 4. Install and run the backend

Open **Terminal 1** from the root of the WiseTrips repository:

```bash
cd backend
uv sync
uv run fastapi dev app/main.py
```

`uv sync` creates the Python environment and installs the project's dependencies. Keep this terminal open.

Verify the backend is running by visiting:

**http://127.0.0.1:8000/docs**

You should see the interactive FastAPI API documentation.

## 5. Install and run the frontend

Open a **second terminal** from the root of the WiseTrips repository:

```bash
cd frontend
npm ci
```

If `npm ci` fails because the project doesn't have a `package-lock.json` yet, run `npm install` instead.

### If you're using Expo Go on your phone

1. **Create an Expo account:** Visit [expo.dev/signup](https://expo.dev/signup) to create a free account if you haven't already.
2. **Sign in on your phone:** Open the **Expo Go** app and log in with your new Expo account.
3. **Sign in through your computer's terminal:** While you're in the `frontend/` directory, run:

   ```bash
   npx expo login
   ```

   Enter your Expo account credentials when prompted. You can check which account is signed in using:

   ```bash
   npx expo whoami
   ```

4. **Use the same account** in Expo Go and in your terminal. This is especially important when testing on a physical iPhone.

If you're using only an iOS Simulator or Android emulator, you can generally skip the Expo account steps.

### Start WiseTrips

Run from `frontend/`:

```bash
npx expo start
```

Expo should display a **QR code** in the terminal. Keep this terminal open while developing.

**If you're using a phone (Windows or Mac):**

1. Make sure the phone and computer are on the same Wi-Fi network.
2. **Android:** Open Expo Go and scan the QR code.
3. **iPhone:** Scan the QR code with the Camera app to open the project in Expo Go.
4. WiseTrips should load on your phone, as long as your Expo Go version is compatible with the project's Expo SDK.

**If you're using the iOS Simulator on a Mac:**

1. Make sure Xcode and an iOS Simulator runtime are installed.
2. With Expo running, press **`i`** in Terminal 2.
3. Expo should launch WiseTrips in the iOS Simulator.

**If you're using an Android emulator:** Start the emulator from Android Studio, then press **`a`** while Expo is running.

Edit the code in VS Code or your preferred editor while the app runs on your phone or simulator. Expo will generally reload your changes automatically.

## 6. Configure local environment variables (if needed)

If the repository contains `.env.example` files in `frontend/` or `backend/`, copy each one to `.env` **in that same folder** and fill in the values provided by the project lead. If no environment variables are needed yet, skip this step.

**Never commit `.env` files or API keys.** Values prefixed with `EXPO_PUBLIC_` are included in the frontend bundle, so do not put secrets there.

## 7. Verify everything works

- [ ] `git`, `node`, `npm`, and `uv` commands work.
- [ ] The backend starts successfully with `uv`.
- [ ] **http://127.0.0.1:8000/docs** opens on your computer.
- [ ] The Expo development server starts successfully.
- [ ] If using Expo Go, you're signed in on the phone and in the terminal with the same Expo account.
- [ ] WiseTrips opens in **Expo Go** or a simulator/emulator.

To stop either server, press **Ctrl+C** in its terminal.