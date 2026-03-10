import essentia
import essentia.standard
import essentia.streaming

import IPython
from pylab import plot, show, figure, imshow
import matplotlib.pyplot as plt

# help(essentia.standard.RhythmExtractor2013)
loader = essentia.standard.MonoLoader(filename='./testAudio/80ishbpmChords.m4a') # ./testAudio/g-major.wav , ./testAudio/90beats.m4a
audio = loader()

# IPython.display.Audio('./g-major.wav')

# plt.rcParams['figure.figsize'] = (15, 6) # set plot sizes to something larger than default

# plot(audio[1*44100:3*44100])
# plt.title("This is how the 2nd second of this audio looks like:")
# show()

rhythm_extractor = essentia.standard.RhythmExtractor2013(method="multifeature")
bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)
print("BPM:", bpm)
print("Beat positions (sec.):", beats)
print("Beat estimation confidence:", beats_confidence)

def beat_analysis(audio_file):
    loader = essentia.standard.MonoLoader(filename=audio_file)
    audio = loader()

    rhythm_extractor = essentia.standard.RhythmExtractor2013(method="multifeature")
    bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)

    return bpm, beats, beats_confidence