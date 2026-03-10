from madmom.features.beats import RNNBeatProcessor, DBNBeatTrackingProcessor

# path to audio file
audio_file = "90beats.m4a"

# compute beat activations
proc = RNNBeatProcessor()
activations = proc(audio_file)

# track beats
beat_tracker = DBNBeatTrackingProcessor(fps=100)
beats = beat_tracker(activations)

print("Detected beats (seconds):")
print(beats)
