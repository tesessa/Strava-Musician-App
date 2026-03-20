import essentia
import essentia.standard
import essentia.streaming

import IPython
from pylab import plot, show, figure, imshow
import matplotlib.pyplot as plt

import os
import sys
from openai import OpenAI

from fastapi import FastAPI, UploadFile, File
import numpy as np
import tempfile
import shutil

import uvicorn

def beat_analysis(audio_file):
    loader = essentia.standard.MonoLoader(filename=audio_file)
    audio = loader()

    rhythm_extractor = essentia.standard.RhythmExtractor2013(method="multifeature")
    bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)

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

@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    # the file is in oracle cloud.
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    bpm, beats, beats_confidence = beat_analysis(tmp_path)

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
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

if __name__ == "__main__":
    uvicorn.run("ai_service:app", host="0.0.0.0", port=8000, reload=True)

# if __name__ == "__main__":
#     args = sys.argv
#     if len(args) > 1:
#         if not os.path.isfile(args[1]):
#             print(f"Error: not a valid audiofile.")
#             sys.exit(1)
#     audio_file = args[1]
#     #analyze beats of audio file
#     bpm, beats, beats_confidence = beat_analysis(audio_file)
#     #send output to ai
#     prompt = f"""
#     You are a guide for practicing guitarists. You give brief helpful feedback based on the data you are given.
#     It should consist of the BPM from the data, and if their rhythm was good or bad. 
#     Give no more than two or three sentences.
#     Here is the data: BPM: {bpm}, Beats: {beats}
#     """
#     client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
#     response = send_prompt(client, prompt)
#     #return model output
#     print(f"Prompt: {prompt}")
#     print(f"Response: {response}")
