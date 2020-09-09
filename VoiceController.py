# Script for recognizing commands and returning them as text.
import speech_recognition as sr

recognizer = sr.Recognizer()
m = sr.Microphone()


def get_command():
    with m as source:
        print("listening for command...")
        command = recognizer.listen(source, phrase_time_limit=5)

        try:
            command_as_text = recognizer.recognize_google(command)
            print(command_as_text)
        except sr.UnknownValueError:
            print("Unknown Command")
            return "Unknown Command"

        except sr.RequestError:
            print("Speech Service is Down")
            return "Speech Service is Down"
        return command_as_text
