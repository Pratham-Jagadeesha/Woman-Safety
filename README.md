# SafeGuard: Woman Safety Demo App

SafeGuard is a modern, responsive web application designed to prioritize safety through quick-access emergency features and a calming, intuitive user interface. This app serves as a demo for a comprehensive personal safety platform.

## 🚀 Features

### 🚨 One-Tap SOS Button
The most critical feature of the app. A large, pulsing SOS button that, when pressed:
- Triggers a loud, looping siren sound.
- Simulates sending alerts and live location to trusted contacts.
- Vibrates the device for haptic feedback.

### 📍 Live Location Sharing
- Toggle live location sharing with a single tap.
- Mock coordinates simulate sharing your real-time position with chosen contacts.
- Visual status indicators show when sharing is active.

### 🗺️ Safe Route Navigation
- A dedicated map view that highlights recommended "Safe Paths" (well-lit streets, active areas).
- Provides visual guidance on areas to avoid based on safety data.

### 📢 Emergency Actions
- **Fake Call**: Simulates an incoming call to help you discreetly leave uncomfortable situations. Includes a digital ringing sound.
- **Loud Alarm**: Plays a high-decibel alarm to deter potential threats and attract attention.
- **Auto Recording**: A mock feature demonstrating the ability to trigger background audio/video recording during emergencies.

### 👥 Trusted Contacts & Police
- Manage your emergency contacts list.
- Quick-dial access to nearby police (911).
- Visual status tells you if you are currently in a "Safe" state.

## 🎨 Design Philosophy
The app uses a **Calming Light Theme**, utilizing soft blues and greens to reduce panic in high-stress situations, while maintaining high contrast for critical alert elements like the SOS button.

## 🛠️ Technology Stack
- **Frontend**: React.js with Vite
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with a custom design system
- **Deployment**: Optimized for Vercel

## 💻 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to the local URL provided by Vite (typically `http://localhost:5173`).

## 📦 Deployment

To deploy to Vercel:
1. Push the code to a GitHub repository.
2. Link the repository to your Vercel project.
3. Vercel will automatically build and deploy using the Vite configuration.

