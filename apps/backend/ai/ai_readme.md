## Run the AI server

From the repo root:

1. `cd apps/backend/ai`
2. Create a virtual environment (use the `python` you want; 3.10+ is fine):
   - **Windows (cmd/PowerShell):** `python -m venv venv`
   - **macOS/Linux:** `python3 -m venv venv` (or `python3.9 -m venv venv` if you rely on 3.9)
3. Activate the venv:
   - **Windows (cmd):** `venv\Scripts\activate.bat`
   - **Windows (PowerShell):** `venv\Scripts\Activate.ps1`
   - **macOS/Linux:** `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. Set `OPENAI_API_KEY` in your environment (or `.env` if you load it elsewhere).
6. `python ai_service.py` (on Windows, `python` is usually correct instead of `python3`)

The service listens on `0.0.0.0:8000`.

### Notes

- **Video / some formats:** For MP4, WebM, etc., decoding may require **ffmpeg** on your PATH. If loading fails, install ffmpeg or convert uploads to WAV/MP3 first.
