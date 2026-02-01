import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'https://barbarapdfeditor.net',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BarbaraPDF Backend Running',
    openaiConfigured: !!process.env.OPENAI_API_KEY 
  });
});

// AI Tutor endpoint
app.post('/api/tutor', async (req, res) => {
  try {
    const { message, conversationHistory = [], selectedText = '' } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      });
    }

    // Build context-aware system prompt
    const systemPrompt = `You are an educational AI tutor for K-12 students. Your role is to:
- Explain concepts clearly and simply
- Break down complex topics into understandable parts
- Provide step-by-step solutions to problems
- Give relevant examples
- Encourage critical thinking
- Be patient and supportive
- Adapt explanations to student level

${selectedText ? `The student has selected this text from their PDF: "${selectedText}"` : ''}

Always respond in a friendly, educational manner. If asked to solve a problem, guide the student through the solution rather than just giving the answer.`;

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model (cheaper than gpt-4)
      messages: messages,
      temperature: 0.7,
      max_tokens: 500, // Limit response length to control costs
    });

    const response = completion.choices[0].message.content;

    res.json({ 
      response,
      usage: completion.usage // Return token usage for monitoring
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid OpenAI API key' });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    if (error.status === 500) {
      return res.status(500).json({ error: 'OpenAI service error. Please try again later.' });
    }

    res.status(500).json({ 
      error: 'Failed to get AI response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
});
