import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[3] / ".env")

from openai import OpenAI

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import numpy as np
import tempfile
import shutil

import uvicorn

import librosa


def beat_analysis(audio_file: str):
    """
    BPM and beat times using librosa (pure Python stack; works on Windows).
    Essentia is not reliably installable via pip on Windows.
    """
    y, sr = librosa.load(audio_file, mono=True)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beat_frames = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    bpm = float(np.atleast_1d(tempo)[0])
    beats = np.asarray(beat_times, dtype=float)
    if beat_frames.size > 0:
        strengths = onset_env[np.minimum(beat_frames, onset_env.shape[0] - 1)]
        denom = float(np.max(onset_env)) + 1e-8
        beats_confidence = float(np.clip(np.mean(strengths) / denom, 0.0, 1.0))
    else:
        beats_confidence = 0.0
    return bpm, beats, beats_confidence

def send_prompt(client, prompt: str, model: str = "gpt-4o-mini") -> str:
    """
    Send a prompt to the OpenAI API and return the response.
    
    Args:
        prompt: The prompt to send to the API
        model: The model to use (default: gpt-4o-mini)
    
    Returns:
        The assistant's response text
    """
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content

app = FastAPI()


class AnalyzeRequest(BaseModel):
    file_url: str


def analyze_local_audio_file(audio_path: str):
    bpm, beats, beats_confidence = beat_analysis(audio_path)

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    # client = OpenAI(api_key="")
    prompt = f"""
    You are a guide for practicing guitarists. You give brief helpful feedback based on the data you are given.
    It should consist of the BPM from the data, and if their rhythm was good or bad. 
    Give no more than two or three sentences.
    The data includes the BPM, the beat positions in seconds, and the confidence of the beat estimation.
    If the beats are within 0.25 seconds of the expected beat positions based on the BPM, then the rhythm is good.
    If the beats are not within 0.25 seconds of the expected beat positions, then the rhythm could be improved.
    Do not reference the rule of 0.25 seconds in your feedback, just use it to determine if the rhythm is good or bad.
    Speak like a music teacher giving feedback to a student. Do not include any numbers or math,
    use technical terms of music production and beat detection, and be encouraging.
    Structure your feedback like this: "BPM: {int(bpm)}
    Your rhythm is good/bad because...".

    Here is the data: BPM: {bpm}, Beats: {beats}
    """
    response = send_prompt(client, prompt)

    return {
        "feedback": response
    }

@app.post("/analyze")
async def analyze_audio(payload: AnalyzeRequest):
    # the file is in oracle cloud.

    file_url = payload.file_url

    response = requests.get(file_url)

    if response.status_code != 200:
        return {"error": "Failed to download file"}

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(response.content)
        tmp_path = tmp.name

    try:
        return analyze_local_audio_file(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.post("/analyze-file")
async def analyze_uploaded_audio(file: UploadFile = File(...)):
    file_ext = os.path.splitext(file.filename or "")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        return analyze_local_audio_file(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

if __name__ == "__main__":
    uvicorn.run("ai_service:app", host="0.0.0.0", port=8000, reload=True)

