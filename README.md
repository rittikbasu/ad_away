<p align="center">
  <img src="https://ik.imagekit.io/zwcfsadeijm/adaway_main_5mV32nDeC.png?updatedAt=1731406621823" alt="AdAway Logo" width="100"/>
</p>
<h1 align="center">
  AdAway (skip sponsored segments on youtube)
</h1>

https://github.com/user-attachments/assets/6c337aa3-9a19-4795-937d-23635014b0c8

Ever been watching your favorite YouTuber when suddenly... "Before we continue, a quick word from today's sponsor, NordVPN!" 😭

That was me, day after day, watching the same VPN ads until I finally snapped. After the 1000000th time hearing about how I needed to "protect my online privacy" (while binge watching mechanical keyboard reviews at 3 AM), I decided enough was enough. That's why I built AdAway, a Chrome extension that uses AI to detect and automatically skip those repetitive sponsored segments. No more NordVPN, no more Squarespace, no more "build your website today with code CREATOR20!"

## ✨ Features

- 🤖 Uses `gpt-4o` to intelligently detect sponsored segments
- ⚡️ Auto detects multiple sponsor segments in a single video
- 🎯 Adds a simple non intrusive "Skip Sponsor" button for manual control
- ⌨️ Keyboard shortcut support (press Enter to skip)
- 🔒 Secure API key storage (not sent to any servers)
- 🎨 A clean and minimal UI

## 🚀 Getting Started

### Prerequisites

- Node.js
- Chrome or Chromium based browsers
- OpenAI API key

### Installation

1. Clone the repo:

   ```bash
    git clone https://github.com/rittikbasu/ad_away.git
   ```

2. Navigate to the project directory:

   ```bash
    cd ad_away
   ```

3. Install dependencies:

   ```bash
    npm install
   ```

4. Build the extension:

   ```bash
    npm run build
   ```

5. Load the extension in Chrome:

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from your project directory

6. Add your OpenAI API key:
   - Click the AdAway extension icon
   - Enter your OpenAI API key
   - Click "Save API Key"

## 🎮 Usage

Just watch YouTube as normal! When you open a video AdAway will:

- Analyze the video transcript
- Detect sponsored segments
- Show a "Skip Sponsor" button when a sponsored segment starts
- Let you skip by pressing the "Skip Sponsor" button or using the Enter key

## 📝 Notes

- The extension needs captions to be available on the video to work
- The sponsored segment timestamps are not cached (for now) so it will reanalyze the same video every time you reload the page
- Your API key is stored securely in Chrome's sync storage

## 🛣️ Roadmap

- [ ] Usage Analytics Dashboard

  - Track number of sponsored segments skipped
  - Monitor video analysis count
  - View token usage and estimated costs
  - Visualize time saved from skipping sponsors

- [ ] Community Database Integration
  - Share analyzed video timestamps
  - Skip instantly on pre-analyzed videos
  - Reduce API costs through timestamp sharing
  - Contribute to a growing database of sponsor segments

## 🤝 Contributing

Found a bug? Want to add a feature? PRs are welcome! Feel free to open issues for any bugs or feature ideas.
