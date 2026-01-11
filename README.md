# 🏨 Orion Hotel Live AI Chat

Complete Google Apps Script + PWA solution for hotel guest assistance powered by Gemini 2.0 Flash.

## 📋 Features

✅ **AI-Powered Chat** - Gemini 2.0 Flash for intelligent guest interactions  
✅ **Multi-Intent Routing** - Emergency, Booking, Housekeeping, Maintenance, F&B, Weather  
✅ **Discord Notifications** - Real-time alerts to 5 department channels  
✅ **Multilingual Support** - EN, AF, ZU, XH auto-detection  
✅ **Weather Integration** - OpenWeatherMap API  
✅ **Payment Links** - Yoco integration for deposits  
✅ **PWA Installable** - Works offline, adds to home screen  
✅ **POPI Compliant** - PII anonymization in logs  
✅ **Rate Limiting** - 10 messages/min per IP  

---

## 🚀 Quick Start

### **Step 1: Deploy Google Apps Script Backend**

1. **Create New Google Apps Script Project**
   - Go to: https://script.google.com
   - Click: **New Project**
   - Name it: "Orion Hotel AI Chat"

2. **Copy Backend Code**
   - Open `code.gs` from this repo
   - Paste entire content into script editor
   - Save (Ctrl+S or File > Save)

3. **Configure Script Properties**
   - Click: **Project Settings** (⚙️ icon)
   - Scroll to **Script Properties**
   - Click **Add script property** for each:

   ```
   GEMINI_API_KEY          → Get from: https://aistudio.google.com/apikey
   WEATHER_API_KEY         → Get from: https://openweathermap.org/api
   RESERVATIONS_WEBHOOK    → Discord webhook URL (see Discord setup below)
   HOUSEKEEPING_WEBHOOK    → Discord webhook URL
   MAINTENANCE_WEBHOOK     → Discord webhook URL
   EMERGENCY_WEBHOOK       → Discord webhook URL
   FRONTDESK_WEBHOOK       → Discord webhook URL
   YOCO_SECRET_KEY         → Optional: Yoco payment API key
   ```

4. **Setup Google Sheets**
   - Click: **Run** > **Select function** > `setupSheets`
   - Click **Run**
   - Grant permissions when prompted
   - Check execution log for spreadsheet URL
   - Open the spreadsheet and verify 4 sheets were created

5. **Verify Setup**
   - Run function: `verifySetup()`
   - Check logs - all items should show ✅
   - Run function: `runSystemTests()` to test integrations

6. **Deploy as Web App**
   - Click: **Deploy** > **New deployment**
   - Click gear icon ⚙️ > **Web app**
   - Settings:
     - **Description:** "Orion Hotel Chat API v1.0"
     - **Execute as:** Me
     - **Who has access:** Anyone
   - Click **Deploy**
   - **COPY THE WEB APP URL** (you'll need this!)
   - Click **Done**

---

### **Step 2: Setup Discord Webhooks**

For each department channel:

1. Open Discord Server Settings
2. Go to: **Integrations** > **Webhooks**
3. Click **New Webhook**
4. Configure:
   - **Name:** "Orion Hotel - Reservations" (or department name)
   - **Channel:** Select target channel
5. Click **Copy Webhook URL**
6. Paste into Script Properties (from Step 1.3)

**Recommended Channel Structure:**
```
🏨 Orion Hotel Server
├─ 📅 #reservations      → RESERVATIONS_WEBHOOK
├─ 🧹 #housekeeping      → HOUSEKEEPING_WEBHOOK
├─ 🔧 #maintenance       → MAINTENANCE_WEBHOOK
├─ 🚨 #emergencies       → EMERGENCY_WEBHOOK
└─ 📞 #front-desk        → FRONTDESK_WEBHOOK
```

---

### **Step 3: Deploy PWA Frontend**

#### **Option A: GitHub Pages (Free)**

1. **Create GitHub Repository**
   ```bash
   mkdir orion-hotel-chat
   cd orion-hotel-chat
   git init
   ```

2. **Add Files**
   - Copy `index.html`, `manifest.json`, `sw.js` to folder
   - **IMPORTANT:** Edit `index.html` line 206:
     ```javascript
     const API_ENDPOINT = 'YOUR_WEB_APP_URL_HERE';
     ```
     Replace with your Google Apps Script Web App URL from Step 1.6

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/orion-hotel-chat.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to: **Settings** > **Pages**
   - Source: **Deploy from branch**
   - Branch: **main** / **(root)**
   - Click **Save**
   - Your site will be at: `https://yourusername.github.io/orion-hotel-chat/`

#### **Option B: Netlify (Free)**

1. Sign up at: https://netlify.com
2. Drag and drop your folder to Netlify
3. Edit `index.html` with your API endpoint
4. Redeploy

#### **Option C: Your Own Server**

1. Upload `index.html`, `manifest.json`, `sw.js` to web server
2. Edit `index.html` API_ENDPOINT
3. Serve via HTTPS (required for PWA)

---

## 🧪 Testing

### **Test Backend (Google Apps Script)**

Run these functions in script editor:

```javascript
// Test all systems
runSystemTests()

// Test individual components
testGeminiAPI()
testWeatherAPI()
testDiscordWebhooks()
```

### **Test Frontend (PWA)**

Open your deployed PWA URL and test:

1. **General Queries**
   - "WiFi password?" → Should return from HotelConfig
   - "What time is checkout?" → Should return 11:00

2. **Housekeeping**
   - "Room 305 needs extra towels" → Discord notification to #housekeeping

3. **Booking Flow**
   - "Book a room for 15-17 Jan" → Multi-step conversation
   - Complete all fields → Discord notification to #reservations

4. **Emergency**
   - "Fire in room 101!" → URGENT Discord notification to #emergencies

5. **Weather**
   - "What's the weather?" → Live Durban forecast

6. **Maintenance**
   - "AC not working in room 202" → Discord notification to #maintenance

---

## 📊 Google Sheets Structure

### **HotelConfig Sheet**
| Key | Value |
|-----|-------|
| HotelName | Durban Beach Hotel |
| WiFiPassword | BeachGuest123 |
| CheckIn | 14:00 |
| CheckOut | 11:00 |
| PoolRules | No glass. Children supervised. |
| EmergencyContact | 0821234567 |

### **NotificationLog Sheet**
Automatically logs all Discord notifications with timestamp, type, room, details, status.

### **RequestLog Sheet**
Logs all chat requests with PII anonymization for POPI compliance.

### **RateLimitLog Sheet**
Tracks requests per IP for rate limiting (10/min).

---

## 🔧 Customization

### **Change Hotel Details**

Edit the `HotelConfig` sheet in Google Sheets:
- Update hotel name, logo, colors
- Change WiFi password
- Modify check-in/out times
- Update emergency contact

### **Add New Intents**

1. Edit `code.gs`:
   - Add new intent constant: `const INTENTS = { ... NEW_INTENT: 'new' }`
   - Create handler function: `handleNewIntent(analysis)`
   - Add to `processMessage()` switch statement

2. Update Gemini prompt in `buildGeminiPrompt()` with new keywords

### **Modify Discord Embeds**

Edit notification functions in `code.gs`:
```javascript
sendDiscordNotification('WEBHOOK_KEY', {
  embeds: [{
    title: 'Your Title',
    description: 'Your message',
    color: 3447003, // Decimal color code
    fields: [
      { name: 'Field', value: 'Value', inline: true }
    ]
  }]
});
```

**Color Codes:**
- Red (Emergency): 16711680
- Green (Success): 3066993
- Blue (Info): 3447003
- Orange (Warning): 15844367
- Gold (Attention): 15844367

---

## 🔐 Security & Privacy

### **POPI Compliance**
- All PII (emails, phone numbers, ID numbers) automatically anonymized in logs
- IP addresses partially masked (xxx.xxx.xxx.xxx → xxx.xxx.0.0)
- No permanent storage of sensitive data

### **Rate Limiting**
- 10 messages per minute per IP
- Automatic blocking of excessive requests
- Logged in RateLimitLog sheet

### **API Security**
- All keys stored in Script Properties (not in code)
- Web App executes as owner (protects credentials)
- Input validation and sanitization

---

## 📱 PWA Installation

### **Android**
1. Open chat in Chrome
2. Tap menu (⋮) > **Add to Home Screen**
3. Tap **Add**
4. App icon appears on home screen

### **iOS**
1. Open chat in Safari
2. Tap Share button (⬆️)
3. Tap **Add to Home Screen**
4. Tap **Add**

### **Desktop**
1. Open chat in Chrome/Edge
2. Click install icon (⊕) in address bar
3. Click **Install**

---

## 🐛 Troubleshooting

### **"API_ENDPOINT not configured" error**
- Edit `index.html` line 206
- Replace placeholder with your Web App URL
- Must include full URL: `https://script.google.com/macros/s/.../exec`

### **Discord notifications not sending**
- Verify webhook URLs in Script Properties
- Run `testDiscordWebhooks()` in script editor
- Check webhook is active in Discord server settings

### **Gemini API errors**
- Verify API key: https://aistudio.google.com/apikey
- Check quota limits
- Run `testGeminiAPI()` for diagnostics

### **Weather not working**
- Verify API key: https://openweathermap.org/api
- Free tier has 1000 calls/day limit
- Run `testWeatherAPI()` to check

### **Chat offline/not loading**
- Check browser console (F12) for errors
- Verify Web App URL is correct
- Ensure service worker registered (check Application tab)

---

## 📈 Monitoring

### **View Logs**
Google Apps Script Editor:
- **View** > **Logs** (Ctrl+Enter)
- Shows all API calls, errors, notifications

### **Check Usage**
- Open Google Sheets spreadsheet
- **NotificationLog** → See all Discord alerts
- **RequestLog** → See all chat messages
- **RateLimitLog** → Monitor traffic

### **Discord Alerts**
All department channels receive formatted embeds with:
- Timestamp
- Request details
- Guest info (if provided)
- Priority level

---

## 🎯 Production Checklist

- [ ] All Script Properties configured
- [ ] setupSheets() executed successfully
- [ ] verifySetup() shows all ✅
- [ ] runSystemTests() passes
- [ ] Web App deployed (Anyone access)
- [ ] Discord webhooks tested
- [ ] PWA deployed with correct API_ENDPOINT
- [ ] HTTPS enabled (required for PWA)
- [ ] Test all 7 intent types
- [ ] Customize HotelConfig sheet
- [ ] Emergency contact verified
- [ ] Backup spreadsheet URL saved

---

## 📞 Support

**Script Issues:**
- Check execution logs in Apps Script editor
- Run diagnostic functions: `verifySetup()`, `runSystemTests()`
- Verify all API keys are valid

**PWA Issues:**
- Check browser console (F12)
- Verify service worker registration
- Clear cache and reload

**Discord Issues:**
- Test webhooks individually
- Verify channel permissions
- Check webhook active status

---

## 📝 License

MIT License - Feel free to customize for your hotel!

---

## 🎉 Credits

Built with:
- Google Apps Script
- Gemini 2.0 Flash API
- OpenWeatherMap API
- Discord Webhooks
- Vanilla JavaScript (PWA)

Created for Orion Hotel - Durban Beach
