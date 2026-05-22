# Hybrid RAG & Local Deployment Architecture

## 1. Hybrid RAG Implementation
To achieve "Hybrid RAG", we combine:
- **Fine-tuned Reasoning**: The model is trained on WHO protocols (using `unsloth_train.py`).
- **Fact Retrieval**: Real-time lookup of medical documents from the SQLite database.

### Retrieval Logic (Server-side)
In `server.ts`, we already implement the "Retrieval" part by querying the `knowledge_base` table:
```typescript
const knowledge = db.prepare("SELECT content FROM knowledge_base WHERE ...").all();
const knowledgeContext = knowledge.map(k => k.content).join("\n");
```
By injecting this context into the local Llama 3 prompt, the model uses its "Fine-tuned Reasoning" to process the "Retrieved Facts".

## 2. Local Server Setup (Ollama)
1. Install Ollama: [ollama.com](https://ollama.com)
2. Create your Doctorian model:
   ```bash
   ollama create doctorian -f Modelfile
   ```
3. The server runs at `http://localhost:11434` by default.

## 3. Connecting to React / Tauri Frontend
The `server.ts` is configured to proxy requests to `http://localhost:11434/v1/chat/completions`. 

### For Tauri (macOS/Windows/Linux):
To allow the frontend to talk to a local backend in Tauri, update `src-tauri/tauri.conf.json`:
```json
{
  "tauri": {
    "allowlist": {
      "http": {
        "all": true,
        "request": true,
        "scope": ["http://localhost/*", "http://localhost:11434/*"]
      }
    }
  }
}
```

### For Web / Vite:
Update your `.env` file:
```env
USE_LOCAL_AI=true
LOCAL_AI_URL=http://localhost:11434/v1/chat/completions
OLLAMA_MODEL=llama3.1
```

The Doctorian AI core will now automatically prioritize the **Local Neural Link** over external APIs.
