from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import models
from database import connect_to_mongo, close_mongo_connection, get_database
from auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user,
    get_current_admin_user
)

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
def user_helper(user) -> dict:
    """Convert MongoDB user document to dict"""
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "createdAt": user["created_at"].isoformat()
    }

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
    
    await db.tools.update_one(
        {"_id": ObjectId(tool_id)},
        {"$set": {
            "average_rating": average_rating,
            "review_count": review_count
        }}
    )

# ===== AUTHENTICATION ROUTES =====

@app.post("/api/auth/register", response_model=models.TokenResponse)
async def register(user_data: models.UserRegister):
    """Register a new user"""
    db = get_database()
    
    # Validation
    if user_data.password != user_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=400, 
            detail="Password must be at least 6 characters"
        )
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="User already exists with this email"
        )
    
    # Create user
    user_dict = {
        "email": user_data.email,
        "name": user_data.name,
        "hashed_password": get_password_hash(user_data.password),
        "role": "user",
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    new_user = await db.users.find_one({"_id": result.inserted_id})
    
    # Create token
    token = create_access_token(data={"sub": str(new_user["_id"])})
    
    return {
        "token": token,
        "user": user_helper(new_user),
        "message": "User registered successfully"
    }

@app.post("/api/auth/login", response_model=models.TokenResponse)
async def login(credentials: models.UserLogin):
    """Login user"""
    db = get_database()
    
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    token = create_access_token(data={"sub": str(user["_id"])})
    
    return {
        "token": token,
        "user": user_helper(user),
        "message": "Login successful"
    }

@app.post("/api/auth/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client-side token removal)"""
    return {"message": "Logout successful"}

@app.get("/api/auth/me", response_model=models.UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return user_helper(current_user)

# ===== TOOL ROUTES =====

@app.get("/")
async def read_root():
    return {
        "message": "AI Tool Discovery API",
        "version": "1.0",
        "database": "MongoDB"
    }

@app.get("/api/tools", response_model=List[models.ToolResponse])
async def get_tools(
    category: Optional[str] = None,
    pricing: Optional[str] = None,
    min_rating: Optional[float] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all tools with optional filters (Protected)"""
    db = get_database()
    query_filter = {}
    if category:
        query_filter["category"] = category
    if pricing:
        query_filter["pricing_model"] = pricing
    if min_rating is not None:
        query_filter["average_rating"] = {"$gte": min_rating}
    
    tools = await db.tools.find(query_filter).to_list(length=None)
    return [tool_helper(tool) for tool in tools]

@app.get("/api/tools/{tool_id}", response_model=models.ToolResponse)
async def get_tool(
    tool_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific tool by ID (Protected)"""
    db = get_database()
    if not ObjectId.is_valid(tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")
    
    tool = await db.tools.find_one({"_id": ObjectId(tool_id)})
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    return tool_helper(tool)

@app.post("/api/tools", response_model=models.ToolResponse)
async def create_tool(
    tool: models.ToolCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new tool (Admin only)"""
    db = get_database()
    tool_dict = tool.model_dump()
    tool_dict["average_rating"] = 0.0
    tool_dict["review_count"] = 0
    
    result = await db.tools.insert_one(tool_dict)
    new_tool = await db.tools.find_one({"_id": result.inserted_id})
    
    return tool_helper(new_tool)

@app.put("/api/tools/{tool_id}", response_model=models.ToolResponse)
async def update_tool(
    tool_id: str,
    tool: models.ToolUpdate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Update a tool (Admin only)"""
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

@app.delete("/api/tools/{tool_id}")
async def delete_tool(
    tool_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete a tool (Admin only)"""
    db = get_database()
    if not ObjectId.is_valid(tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")
    
    await db.reviews.delete_many({"tool_id": tool_id})
    result = await db.tools.delete_one({"_id": ObjectId(tool_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    return {"message": "Tool deleted successfully"}

# ===== REVIEW ROUTES =====

@app.post("/api/reviews", response_model=models.ReviewResponse)
async def create_review(
    review: models.ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    """Submit a review for a tool (Protected)"""
    db = get_database()
    
    if not ObjectId.is_valid(review.tool_id):
        raise HTTPException(status_code=400, detail="Invalid tool ID")
    
    tool = await db.tools.find_one({"_id": ObjectId(review.tool_id)})
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    review_dict = review.model_dump()
    review_dict["tool_name"] = tool["name"]
    review_dict["user_id"] = str(current_user["_id"])
    review_dict["status"] = "pending"
    review_dict["date"] = datetime.now().strftime("%Y-%m-%d")
    
    result = await db.reviews.insert_one(review_dict)
    new_review = await db.reviews.find_one({"_id": result.inserted_id})
    
    return review_helper(new_review)

@app.get("/api/reviews", response_model=List[models.ReviewResponse])
async def get_reviews(
    tool_id: Optional[str] = None,
    status: Optional[str] = "approved",
    current_user: dict = Depends(get_current_user)  # ✅ NOT admin-only
):
    db = get_database()
    query_filter = {}

    # Normal users can ONLY see approved reviews
    if status != "approved" and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view these reviews")

    if tool_id:
        if not ObjectId.is_valid(tool_id):
            raise HTTPException(status_code=400, detail="Invalid tool ID")
        query_filter["tool_id"] = tool_id

    query_filter["status"] = status

    reviews = await db.reviews.find(query_filter).to_list(length=None)
    return [review_helper(review) for review in reviews]

@app.patch("/api/reviews/{review_id}", response_model=models.ReviewResponse)
async def moderate_review(
    review_id: str,
    action: models.ReviewAction,
    current_user: dict = Depends(get_current_admin_user)
):
    """Approve or reject a review (Admin only)"""
    db = get_database()
    
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="Invalid review ID")
    
    if action.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    await db.reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {"status": action.status}}
    )
    
    await recalculate_tool_rating(review["tool_id"])
    
    updated_review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    return review_helper(updated_review)

# ===== UTILITY ROUTES =====

@app.get("/api/categories")
async def get_categories():
    """Get list of available categories"""
    return ["NLP", "Computer Vision", "Dev Tools", "Audio", "Video", "Data Analytics"]

@app.get("/api/pricing-models")
async def get_pricing_models():
    """Get list of available pricing models"""
    return ["Free", "Paid", "Subscription"]

@app.get("/api/stats")
async def get_stats(current_user: dict = Depends(get_current_admin_user)):
    """Get platform statistics (Admin only)"""
    db = get_database()
    
    total_tools = await db.tools.count_documents({})
    total_reviews = await db.reviews.count_documents({})
    pending_reviews = await db.reviews.count_documents({"status": "pending"})
    approved_reviews = await db.reviews.count_documents({"status": "approved"})
    total_users = await db.users.count_documents({})
    
    return {
        "total_tools": total_tools,
        "total_reviews": total_reviews,
        "pending_reviews": pending_reviews,
        "approved_reviews": approved_reviews,
        "total_users": total_users
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
