# Import the InferencePipeline object
import os
import cv2
import numpy as np
from inference import InferencePipeline
from openai import OpenAI
import base64
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Fetch the API key from the environment variables
APIKEY = os.getenv("APIKEY")
api_key = os.getenv("api_key")


client = OpenAI(api_key=APIKEY)

# Import the built in render_boxes sink for visualizing results
from inference.core.interfaces.stream.sinks import render_boxes
counter = 0
imgcounter = 0
foundcards = []

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def get_card_from_image(image_path):
    global foundcards
    base64_image = encode_image(image_path)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "You are a assistant that tells me what playing card is present in the image. For example, if there is the five of diamonds in the image, return '5D'. Do not attempt to guess on a blurry image, in this case return NONE. Return NONE if you have any doubt as accuracy is the most important thing.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
    )
    response = str(response.choices[0].message.content)
    if response == "NONE":
        return None
    else:
        if response not in foundcards:
            print("New card found: " + response)
            foundcards.append(response)
        else:
            print("Duplicate card found: " + response)
    return response
        





def crop_image(image: np.ndarray, x: int, y: int, width: int, height: int) -> np.ndarray:
    
    roi_x = int(x - width / 2)
    roi_y = int(y - height / 2)
    roi_width = int(width)
    roi_height = int(height)
    roi = image[roi_y:roi_y+roi_height, roi_x:roi_x+roi_width]
    return roi



OUTPUT_FOLDER = "output_boxes"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def onprediction(predictions, video_frame):
    global imgcounter
    global counter
    render_boxes(predictions, video_frame)
    if counter == 50:
        if predictions['predictions'] is not None:
            for i in predictions['predictions']:
                x = int(i['x'])
                y = int(i['y'])
                width = int(i['width'])
                height = int(i['height'])
                print("X: " + str(x))
                print("Y: " + str(y))
                print("W: " + str(width))
                print("H: " + str(height))
                cropped_image = crop_image(video_frame.image, x, y, width, height)
                cv2.imwrite(os.path.join(OUTPUT_FOLDER, "box" + str(imgcounter) + ".jpg"), cropped_image)
                get_card_from_image(os.path.join(OUTPUT_FOLDER, "box" + str(imgcounter) + ".jpg"))
                print(foundcards)
                imgcounter = imgcounter + 1
                counter = 0
    else:
        counter = counter + 1
# initialize a pipeline object
pipeline = InferencePipeline.init(
    model_id="cards-mjsx0/3", # Roboflow model to use #playing-cards-ow27d/4 #cards-mjsx0/3
    video_reference="counting.mp4", # Path to video, device id (int, usually 0 for built in webcams), or RTSP stream url
    on_prediction=onprediction, # Function to run after each prediction
)
pipeline.start()
pipeline.join()