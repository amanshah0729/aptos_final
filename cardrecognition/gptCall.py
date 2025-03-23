import os
from dotenv import load_dotenv
import openai
from PIL import Image
import base64
import io
from openai import OpenAI
#client = OpenAI()

# Load environment variables from the .env file
load_dotenv()
count = 0;
amount_of_deck_left = 1
suits = ['S', 'H', 'D', 'C']  # Spades, Hearts, Diamonds, Clubs
ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
true_count = 0

# Create the deck using a list comprehension
deck = [f"{rank}{suit}" for suit in suits for rank in ranks]

# Get the API key from the .env file
openai.api_key = os.getenv("APIKEY")
#url = "https://firebasestorage.googleapis.com/v0/b/whatsthemove-4a5b3.appspot.com/o/images%2FScreenshot%202025-01-25%20at%201.24.21%E2%80%AFPM.png?alt=media&token=9cb591e1-f589-4215-9eed-25b2b2986016"

def process_image_and_chat(url):
    """
    Processes an image and uses OpenAI's GPT model to interact with the image as part of the prompt.
    Args:
        image_path (str): url to the image .
    Returns:
        str: AI response text from OpenAI's chat model.
    """
    global count
    global deck
    # Make the API call
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "If you detect a playing card in this image please tell me which it is? If you are not 1000 percent sure you are correct, please respond with no card. Return your answer and nothing else. If there are multiple cards, just return one of them. For example, ten of hearts should simply return 10H"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": url,
                            },
                        },
                    ],
                }
            ],
            max_tokens=300,
        )
        final = response.choices[0].message.content.strip()
        print(final)
        count, deck = high_low_count(deck, final, count)
        return final
    except Exception as e:
        print("error")
        return f"An error occurred: {e}"
    
    # High-Low Card Counting Algorithm
def high_low_count(deck, final, count):
    global true_count
    """
    Adjusts the count based on the High-Low card counting system.
    
    Args:
        deck (list): The current deck of cards.
        final (str): The card drawn in the format "AS", "10H", etc.
        count (int): The current count value.

    Returns:
        int: Updated count after processing the drawn card.
    """
    # Ensure the card is in the deck
    if final in deck:
        deck.pop(deck.index(final))  # Remove the card from the deck
        
        # High-Low card counting rules
        if final.startswith(('10', 'J', 'Q', 'K', 'A')):
            print("decrement count")
            count -= 1  # High cards decrease the count
        elif final.startswith(('2', '3', '4', '5', '6')):
            print("increment count")
            count += 1  # Low cards increase the count
        # 7, 8, and 9 are neutral and do not affect the count
    deck_left = len(deck)/52
    true_count = count/deck_left
    print(true_count)
    return count, deck



# Example usage



    
url1 = "https://firebasestorage.googleapis.com/v0/b/whatsthemove-4a5b3.appspot.com/o/images%2Fbox11441492209263.jpg?alt=media&token=40d932c2-f207-483b-8868-bd4401cc0ec1"
url2 = "https://firebasestorage.googleapis.com/v0/b/whatsthemove-4a5b3.appspot.com/o/images%2Fbox12681764215120.jpg?alt=media&token=2637f820-eb02-4e44-8d81-58fdbcf93a9f"
url3 = "https://firebasestorage.googleapis.com/v0/b/whatsthemove-4a5b3.appspot.com/o/images%2Fbox12861197162153.jpg?alt=media&token=559aece2-dfb6-481d-be05-a95c767c7e8e"
url4 = "https://firebasestorage.googleapis.com/v0/b/whatsthemove-4a5b3.appspot.com/o/images%2Fbox12891149171151.jpg?alt=media&token=420d1271-d4d6-4dd6-bf82-51db19f98787"
url5 = "https://firebasestorage.googleapis.com/v0/b/whatsthemove-4a5b3.appspot.com/o/images%2Fbox12961067147144.jpg?alt=media&token=fadea30a-1565-44d9-b051-084ed585f5ba"

process_image_and_chat(url1)
process_image_and_chat(url2)
process_image_and_chat(url3)
process_image_and_chat(url4)
process_image_and_chat(url5)