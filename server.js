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

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama3.2",
        messages: [{role:"system",content:req.body.system}, ...messages],
        stream: false
      })
    });
    const data = await response.json();
    res.json({
      content: [{text: data.message?.content || "Erreur"}]
    });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));