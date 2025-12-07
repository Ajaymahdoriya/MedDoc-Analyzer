const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Robust .env loading
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file from:", envPath, result.error);
} else {
    console.log(".env loaded successfully from:", envPath);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Gemini Setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables!");
} else {
    console.log("GEMINI_API_KEY found (length: " + apiKey.length + ")");
}
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to file to generative part
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

app.post('/api/analyze-bill', upload.single('document'), async (req, res) => {
    try {
        const imagePath = req.file?.path;
        const textInput = req.body.text;

        if (!imagePath && !textInput) {
            return res.status(400).json({ status: "no_amounts_found", reason: "No input provided" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Analyze this medical bill. Extract financial amounts.
            Fix OCR errors (e.g. 'O' to '0').
            Classify amounts as 'total_bill', 'paid', or 'due'.
            
            Return ONLY valid JSON matching this structure:
            {
                "currency": "detected currency code (e.g. INR, USD)",
                "amounts": [
                    { "type": "total_bill", "value": number, "source": "exact text snippet found in doc" }
                ],
                "status": "ok"
            }
            If no amounts are found, return { "status": "no_amounts_found", "reason": "document too noisy" }
        `;

        // Helper for rate limit handling
        async function generateWithRetry(model, content) {
            const maxRetries = 3;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    return await model.generateContent(content);
                } catch (error) {
                    if (error.status === 429 || (error.message && error.message.includes('429'))) {
                        let waitTime = 10000;
                        const match = error.message.match(/retry in (\d+(\.\d+)?)s/);
                        if (match && match[1]) {
                            waitTime = Math.ceil(parseFloat(match[1]) * 1000) + 2000;
                        }

                        console.log(`Rate limit hit. Google requested wait: ${waitTime / 1000}s. Retrying...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    } else {
                        throw error;
                    }
                }
            }
            throw new Error("Service is currently busy (Rate Limit). Please try again in 2 minutes.");
        }

        let result;
        if (imagePath) {
            const imagePart = fileToGenerativePart(imagePath, req.file.mimetype);
            result = await generateWithRetry(model, [prompt, imagePart]);
        } else {
            result = await generateWithRetry(model, [prompt, textInput]);
        }

        const responseText = result.response.text();
        console.log("Gemini Response:", responseText);

        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);

        // Cleanup
        if (imagePath) fs.unlinkSync(imagePath);

        res.json(data);

    } catch (error) {
        console.error("Error processing bill:", error);
        res.status(500).json({ status: "error", message: "Processing failed", details: error.message });
        if (req.file?.path) fs.unlinkSync(req.file.path); // Cleanup on error
    }
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Keep the process alive
setInterval(() => {}, 1000);
