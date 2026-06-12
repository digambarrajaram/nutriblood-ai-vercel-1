import base64
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
import os

load_dotenv()


image_path = "images/blood_work.png"

def encode_local_image(image_path: str) -> str:
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Could not find local image at: {image_path}")
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


#print(encode_local_image(image_path))


llm = ChatGroq(
    model_name="meta-llama/llama-4-scout-17b-16e-instruct", 
    temperature=0.0
)

message_content = [
    {
        "type": "text", 
        "text": "Analyze these provided local image and provide one line summary and list of food items to avoid and list of food items to eat."
    }
]

# Append each encoded local image to the list
for path in [image_path]:
    base64_string = encode_local_image(path)
    message_content.append({
        "type": "image_url",
        "image_url": {
            "url": f"data:image/png;base64,{base64_string}"
        }
    })

human_message = HumanMessage(content=message_content)
print("Sending local images to Groq vision engine...")
response = llm.invoke([human_message])

print("\n--- Model Analysis Result ---")
print(response.content)