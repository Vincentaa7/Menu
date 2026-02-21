import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY)

CHEF_BOT_SYSTEM_PROMPT = (
    "Kamu adalah 'Chef Bot', asisten koki virtual yang cerdas, ramah, dan sangat ahli "
    "dalam dunia kuliner untuk aplikasi SaaS berbagi resep masakan. "
    "TUGAS UTAMAMU: Membantu pengguna mencari ide masakan, memodifikasi takaran bahan, "
    "menyarankan bahan pengganti, dan memberikan tips memasak, serta menjawab cara pakai aplikasi ini. "
    "ATURAN KETAT: Kamu HANYA boleh merespons topik makanan, dapur, dan aplikasi ini. "
    "Jika di luar topik, tolak dengan sopan ('Maaf, keahlian saya hanya berkutat di dapur!'). "
    "Gunakan bahasa Indonesia yang santai, antusias, dan berikan jawaban ringkas terstruktur."
)


class ChatRequest(BaseModel):
    message: str
    # Optional conversation history for context
    history: list[dict] = []


@router.post("")
def chat(request: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    messages = [{"role": "system", "content": CHEF_BOT_SYSTEM_PROMPT}]

    # Include conversation history (max last 10 turns to stay within token limits)
    for turn in request.history[-10:]:
        if turn.get("role") in ("user", "assistant") and turn.get("content"):
            messages.append({"role": turn["role"], "content": turn["content"]})

    messages.append({"role": "user", "content": request.message})

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=512,
            temperature=0.7,
        )
        reply = completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        print(f"[CHAT ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")
