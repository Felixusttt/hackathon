from fastapi import FastAPI, HTTPException, Query

from fastapi.middleware.cors import CORSMiddleware

from typing import Optional, List

from datetime import datetime

from bson import ObjectId

import models

from database import connect_to_mongo, close_mongo_connection, get_database
 
app = FastAPI(title="AI Tool Discovery API", version="1.0")
 
# CORS middleware

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)
 
# Startup and shutdown events

@app.on_event("startup")

async def startup_db_client():

    await connect_to_mongo()
 
@app.on_event("shutdown")

async def shutdown_db_client():

    await close_mongo_connection()
 
# Helper functions

def tool_helper(tool) -> dict:

    """Convert MongoDB document to dict"""

    return {

        "id": str(tool["_id"]),

        "name": tool["name"],

        "use_case": tool["use_case"],

        "category": tool["category"],

        "pricing_model": tool["pricing_model"],

        "average_rating": tool.get("average_rating", 0.0),

        "review_count": tool.get("review_count", 0)

    }
 
def review_helper(review) -> dict:

    """Convert MongoDB document to dict"""

    return {

        "id": str(review["_id"]),

        "tool_id": review["tool_id"],

        "tool_name": review["tool_name"],

        "rating": review["rating"],

        "comment": review.get("comment"),

        "status": review["status"],

        "date": review["date"]

    }
 
async def recalculate_tool_rating(tool_id: str):

    """Recalculate average rating for a tool"""

    db = get_database()

    # Get all approved reviews for this tool

    approved_reviews = await db.reviews.find({

        "tool_id": tool_id,

        "status": "approved"

    }).to_list(length=None)

    if approved_reviews:

        total_rating = sum(r["rating"] for r in approved_reviews)

        average_rating = round(total_rating / len(approved_reviews), 1)

        review_count = len(approved_reviews)

    else:

        average_rating = 0.0

        review_count = 0

    # Update tool

    await db.tools.update_one(

        {"_id": ObjectId(tool_id)},

        {"$set": {

            "average_rating": average_rating,

            "review_count": review_count

        }}

    )
 
# Routes

@app.get("/")

async def read_root():

    return {

        "message": "AI Tool Discovery API",

        "version": "1.0",

        "database": "MongoDB"

    }
 
@app.get("/tools", response_model=List[models.ToolResponse])

async def get_tools(

    category: Optional[str] = None,

    pricing: Optional[str] = None,

    min_rating: Optional[float] = None

):

    """Get all tools with optional filters"""

    db = get_database()

    # Build query filter

    query_filter = {}

    if category:

        query_filter["category"] = category

    if pricing:

        query_filter["pricing_model"] = pricing

    if min_rating is not None:

        query_filter["average_rating"] = {"$gte": min_rating}

    tools = await db.tools.find(query_filter).to_list(length=None)

    return [tool_helper(tool) for tool in tools]
 
@app.get("/tools/{tool_id}", response_model=models.ToolResponse)

async def get_tool(tool_id: str):

    """Get a specific tool by ID"""

    db = get_database()

    if not ObjectId.is_valid(tool_id):

        raise HTTPException(status_code=400, detail="Invalid tool ID")

    tool = await db.tools.find_one({"_id": ObjectId(tool_id)})

    if not tool:

        raise HTTPException(status_code=404, detail="Tool not found")

    return tool_helper(tool)
 
@app.post("/tools", response_model=models.ToolResponse)

async def create_tool(tool: models.ToolCreate):

    """Create a new tool (Admin)"""

    db = get_database()

    tool_dict = tool.model_dump()

    tool_dict["average_rating"] = 0.0

    tool_dict["review_count"] = 0

    result = await db.tools.insert_one(tool_dict)

    new_tool = await db.tools.find_one({"_id": result.inserted_id})

    return tool_helper(new_tool)
 
@app.put("/tools/{tool_id}", response_model=models.ToolResponse)

async def update_tool(tool_id: str, tool: models.ToolUpdate):

    """Update a tool (Admin)"""

    db = get_database()

    if not ObjectId.is_valid(tool_id):

        raise HTTPException(status_code=400, detail="Invalid tool ID")

    tool_dict = tool.model_dump()

    result = await db.tools.update_one(

        {"_id": ObjectId(tool_id)},

        {"$set": tool_dict}

    )

    if result.matched_count == 0:

        raise HTTPException(status_code=404, detail="Tool not found")

    updated_tool = await db.tools.find_one({"_id": ObjectId(tool_id)})

    return tool_helper(updated_tool)
 
@app.delete("/tools/{tool_id}")

async def delete_tool(tool_id: str):

    """Delete a tool (Admin)"""

    db = get_database()

    if not ObjectId.is_valid(tool_id):

        raise HTTPException(status_code=400, detail="Invalid tool ID")

    # Delete all reviews for this tool

    await db.reviews.delete_many({"tool_id": tool_id})

    # Delete the tool

    result = await db.tools.delete_one({"_id": ObjectId(tool_id)})

    if result.deleted_count == 0:

        raise HTTPException(status_code=404, detail="Tool not found")

    return {"message": "Tool deleted successfully"}
 
@app.post("/reviews", response_model=models.ReviewResponse)

async def create_review(review: models.ReviewCreate):

    """Submit a review for a tool"""

    db = get_database()

    # Check if tool exists

    if not ObjectId.is_valid(review.tool_id):

        raise HTTPException(status_code=400, detail="Invalid tool ID")

    tool = await db.tools.find_one({"_id": ObjectId(review.tool_id)})

    if not tool:

        raise HTTPException(status_code=404, detail="Tool not found")

    review_dict = review.model_dump()

    review_dict["tool_name"] = tool["name"]

    review_dict["status"] = "pending"

    review_dict["date"] = datetime.now().strftime("%Y-%m-%d")

    result = await db.reviews.insert_one(review_dict)

    new_review = await db.reviews.find_one({"_id": result.inserted_id})

    return review_helper(new_review)
 
@app.get("/reviews", response_model=List[models.ReviewResponse])

async def get_reviews(

    tool_id: Optional[str] = None,

    status: Optional[str] = None

):

    """Get all reviews with optional filters (Admin)"""

    db = get_database()

    query_filter = {}

    if tool_id:

        if not ObjectId.is_valid(tool_id):

            raise HTTPException(status_code=400, detail="Invalid tool ID")

        query_filter["tool_id"] = tool_id

    if status:

        query_filter["status"] = status

    reviews = await db.reviews.find(query_filter).to_list(length=None)

    return [review_helper(review) for review in reviews]
 
@app.patch("/reviews/{review_id}", response_model=models.ReviewResponse)

async def moderate_review(review_id: str, action: models.ReviewAction):

    """Approve or reject a review (Admin)"""

    db = get_database()

    if not ObjectId.is_valid(review_id):

        raise HTTPException(status_code=400, detail="Invalid review ID")

    if action.status not in ["approved", "rejected"]:

        raise HTTPException(status_code=400, detail="Invalid status")

    review = await db.reviews.find_one({"_id": ObjectId(review_id)})

    if not review:

        raise HTTPException(status_code=404, detail="Review not found")

    # Update review status

    await db.reviews.update_one(

        {"_id": ObjectId(review_id)},

        {"$set": {"status": action.status}}

    )

    # Recalculate tool rating

    await recalculate_tool_rating(review["tool_id"])

    updated_review = await db.reviews.find_one({"_id": ObjectId(review_id)})

    return review_helper(updated_review)
 
@app.get("/categories")

async def get_categories():

    """Get list of available categories"""

    return ["NLP", "Computer Vision", "Dev Tools", "Audio", "Video", "Data Analytics"]
 
@app.get("/pricing-models")

async def get_pricing_models():

    """Get list of available pricing models"""

    return ["Free", "Paid", "Subscription"]
 
@app.get("/stats")

async def get_stats():

    """Get platform statistics"""

    db = get_database()

    total_tools = await db.tools.count_documents({})

    total_reviews = await db.reviews.count_documents({})

    pending_reviews = await db.reviews.count_documents({"status": "pending"})

    approved_reviews = await db.reviews.count_documents({"status": "approved"})

    return {

        "total_tools": total_tools,

        "total_reviews": total_reviews,

        "pending_reviews": pending_reviews,

        "approved_reviews": approved_reviews

    }
 
if __name__ == "__main__":

    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
 