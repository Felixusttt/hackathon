import asyncio

from motor.motor_asyncio import AsyncIOMotorClient

from datetime import datetime
 
MONGODB_URL = "mongodb://localhost:27017/"

DATABASE_NAME = "ai_tools_db"
 
async def seed_database():

    """Seed the database with initial data"""

    client = AsyncIOMotorClient(MONGODB_URL)

    db = client[DATABASE_NAME]

    # Clear existing data

    await db.tools.delete_many({})

    await db.reviews.delete_many({})

    # Sample tools

    tools = [

        {

            "name": "GPT-4",

            "use_case": "Text generation and language understanding",

            "category": "NLP",

            "pricing_model": "Paid",

            "average_rating": 4.5,

            "review_count": 12

        },

        {

            "name": "Midjourney",

            "use_case": "AI image generation from text prompts",

            "category": "Computer Vision",

            "pricing_model": "Subscription",

            "average_rating": 4.8,

            "review_count": 24

        },

        {

            "name": "GitHub Copilot",

            "use_case": "AI-powered code completion",

            "category": "Dev Tools",

            "pricing_model": "Subscription",

            "average_rating": 4.3,

            "review_count": 18

        },

        {

            "name": "DALL-E 3",

            "use_case": "Create realistic images from descriptions",

            "category": "Computer Vision",

            "pricing_model": "Paid",

            "average_rating": 4.6,

            "review_count": 15

        },

        {

            "name": "Hugging Face",

            "use_case": "Open-source ML models and datasets",

            "category": "NLP",

            "pricing_model": "Free",

            "average_rating": 4.7,

            "review_count": 30

        }

    ]

    result = await db.tools.insert_many(tools)

    print(f"Inserted {len(result.inserted_ids)} tools")

    # Sample reviews (optional)

    tool_ids = [str(id) for id in result.inserted_ids]

    reviews = [

        {

            "tool_id": tool_ids[0],

            "tool_name": "GPT-4",

            "rating": 5,

            "comment": "Excellent for content generation!",

            "status": "pending",

            "date": datetime.now().strftime("%Y-%m-%d")

        },

        {

            "tool_id": tool_ids[1],

            "tool_name": "Midjourney",

            "rating": 4,

            "comment": "Great quality but expensive",

            "status": "pending",

            "date": datetime.now().strftime("%Y-%m-%d")

        }

    ]

    result = await db.reviews.insert_many(reviews)

    print(f"Inserted {len(result.inserted_ids)} reviews")

    client.close()

    print("Database seeded successfully!")
 
if __name__ == "__main__":

    asyncio.run(seed_database())
 