# MedDoc Analyzer

A full-stack medical bill analyzer that uses AI to extract financial information from medical bills and documents.

## 🌟 Features

- **AI-Powered Analysis**: Uses Google's Gemini AI to analyze medical bills
- **Smart OCR**: Automatically fixes OCR errors (e.g., 'O' to '0')
- **Amount Classification**: Categorizes amounts as total bill, paid, or due
- **Currency Detection**: Automatically detects currency (INR, USD, etc.)
- **Image Preview**: See uploaded document before analysis
- **Real-time Results**: Get instant analysis with detailed breakdown

## 🚀 Live Demo

- **Frontend**: https://meddoc-analyzer-frontend.onrender.com/
- **Backend**: https://meddoc-analyzer-backend.onrender.com

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- CSS3 (Custom styling)

### Backend
- Node.js
- Express.js
- Multer (File uploads)
- Google Generative AI (Gemini 2.5 Flash)
- CORS enabled

## Architecture
```
[Client (React/Vite)]  <-- HTTPS -->  [Server (Express)]  <-- API -->  [Google Gemini AI]
       |                                    |
   Premium UI                         Multipart Parse
       |                                    |
   JSON Display                        JSON Cleaning
```

## 📦 Installation & Local Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Clone Repository

```bash
git clone https://github.com/Ajaymahdoriya/MedDoc-Analyzer.git
cd MedDoc-Analyzer
```

### Backend Setup

```bash
cd server
npm install

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start server
npm start
```

Server runs on `http://localhost:3000`

### Frontend Setup

```bash
cd client
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `server` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000
```

### Frontend API URL

For local development, the frontend connects to `http://localhost:3000`.
For production, update the URL in `client/src/App.jsx`:

```javascript
const response = await fetch('https://your-backend-url.onrender.com/api/analyze-bill', {
  method: 'POST',
  body: formData,
})
```

## 🚀 Deployment

### Backend (Render)

1. **Prepare Backend for Deployment:**
   ```bash
   cd server
   git init
   git add .
   git commit -m "Initial backend setup"
   git remote add origin https://github.com/YOUR_USERNAME/meddoc-analyzer-backend.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect your backend repository
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Add Environment Variable:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: Your Gemini API key
   - Click **"Create Web Service"**

### Frontend (Vercel/Netlify)

#### Option 1: Vercel (Recommended)
```bash
cd client
npm run build
npx vercel --prod
```

Or via Dashboard:
1. Push client code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Auto-detected settings work perfectly
4. Deploy

#### Option 2: Netlify
1. Push client code to GitHub
2. Import project on [Netlify](https://netlify.com)
3. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Deploy

## 📖 Usage

1. Open the application in your browser
2. Click the upload area or drag & drop a medical bill image
3. Click **"Analyze Document"**
4. Wait for AI processing (may take a few seconds)
5. View extracted amounts with currency and source information

## 📁 Project Structure

```
MedDoc-Analyzer/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── App.jsx        # Main component
│   │   ├── App.css        # Styles
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Express app
│   ├── index.js          # Main server file
│   ├── package.json
│   ├── .env              # Environment variables (gitignored)
│   └── uploads/          # Temporary file storage
│
└── README.md
```

## 🔑 API Endpoints

### POST `/api/analyze-bill`

Analyzes uploaded medical bill image.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `document` (image file)

**Response:**
```json
{
  "status": "ok",
  "currency": "INR",
  "amounts": [
    {
      "type": "total_bill",
      "value": 5000,
      "source": "Total Amount: Rs. 5,000"
    },
    {
      "type": "paid",
      "value": 2000,
      "source": "Paid: Rs. 2,000"
    },
    {
      "type": "due",
      "value": 3000,
      "source": "Balance Due: Rs. 3,000"
    }
  ]
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Processing failed",
  "details": "Error description"
}
```

## 🧪 Testing with cURL

Test the backend independently:

**Image Upload:**
```bash
curl -X POST -F "document=@/path/to/bill.jpg" https://meddoc-analyzer-backend.onrender.com/api/analyze-bill
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Backend not responding:**
- Check if `GEMINI_API_KEY` is set in Render environment variables
- Check Render logs for errors
- Verify the backend URL is correct

**CORS errors:**
- Backend already has CORS enabled for all origins
- If still facing issues, check browser console for details

**JSON parsing errors:**
- This usually means the AI response format changed
- Check backend logs for the raw Gemini response

**File upload fails:**
- Ensure file is an image (JPG, PNG, WEBP)
- Check file size (keep under 5MB for best performance)

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Ajay Mahdoriya**
- GitHub: [@Ajaymahdoriya](https://github.com/Ajaymahdoriya)

## 🙏 Acknowledgments

- Google Gemini AI for powerful document analysis
- React team for the amazing framework
- Vite for lightning-fast development experience
- Express.js community

## 📧 Support

For any queries or support:
- Open an issue on GitHub
- Contact through GitHub profile

---

⭐ **Star this repo if you find it helpful!**

Made with ❤️ by Ajay Mahdoriya
