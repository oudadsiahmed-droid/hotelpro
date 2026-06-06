import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const messages = req.body.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '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',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        system: req.body.system,
        messages: messages
      })
    });

    const data = await response.json();
    if (data.error) { res.status(500).json({error: data.error.message}); return; }
    res.json({ content: [{text: data.content[0].text}] });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));