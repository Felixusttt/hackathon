from motor.motor_asyncio import AsyncIOMotorClient

from pymongo import ASCENDING, DESCENDING

import os
 
# MongoDB connection settings

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")

DATABASE_NAME = "ai_tools_db"
 
# MongoDB client

client = None

database = None
 
async def connect_to_mongo():

    """Connect to MongoDB"""

    global client, database

    client = AsyncIOMotorClient(MONGODB_URL)

    database = client[DATABASE_NAME]

    # Create indexes

    await database.tools.create_index([("name", ASCENDING)])

    await database.tools.create_index([("category", ASCENDING)])

    await database.tools.create_index([("pricing_model", ASCENDING)])

    await database.tools.create_index([("average_rating", DESCENDING)])

    await database.reviews.create_index([("tool_id", ASCENDING)])

    await database.reviews.create_index([("status", ASCENDING)])

    print("Connected to MongoDB!")
 
async def close_mongo_connection():

    """Close MongoDB connection"""

    global client

    if client:

        client.close()

        print("Closed MongoDB connection!")
 
def get_database():

    """Get database instance"""

    return database
 