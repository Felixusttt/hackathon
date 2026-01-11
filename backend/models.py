from pydantic import BaseModel, Field, ConfigDict

from typing import Optional

from bson import ObjectId

from enum import Enum
 
class PyObjectId(ObjectId):

    """Custom ObjectId type for Pydantic"""

    @classmethod

    def __get_validators__(cls):

        yield cls.validate
 
    @classmethod

    def validate(cls, v, info):

        if not ObjectId.is_valid(v):

            raise ValueError("Invalid ObjectId")

        return ObjectId(v)
 
    @classmethod

    def __get_pydantic_json_schema__(cls, field_schema):

        field_schema.update(type="string")
 
class PricingModel(str, Enum):

    FREE = "Free"

    PAID = "Paid"

    SUBSCRIPTION = "Subscription"
 
class ReviewStatus(str, Enum):

    PENDING = "pending"

    APPROVED = "approved"

    REJECTED = "rejected"
 
class ToolBase(BaseModel):

    name: str

    use_case: str

    category: str

    pricing_model: str
 
class ToolCreate(ToolBase):

    pass
 
class ToolUpdate(ToolBase):

    pass
 
class ToolInDB(ToolBase):

    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    average_rating: float = 0.0

    review_count: int = 0

    model_config = ConfigDict(

        populate_by_name=True,

        arbitrary_types_allowed=True,

        json_encoders={ObjectId: str}

    )
 
class ToolResponse(BaseModel):

    id: str

    name: str

    use_case: str

    category: str

    pricing_model: str

    average_rating: float

    review_count: int

    model_config = ConfigDict(

        populate_by_name=True,

        json_encoders={ObjectId: str}

    )
 
class ReviewBase(BaseModel):

    rating: int = Field(ge=1, le=5)

    comment: Optional[str] = None
 
class ReviewCreate(ReviewBase):

    tool_id: str
 
class ReviewInDB(ReviewBase):

    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    tool_id: str

    tool_name: str

    status: str = ReviewStatus.PENDING.value

    date: str

    model_config = ConfigDict(

        populate_by_name=True,

        arbitrary_types_allowed=True,

        json_encoders={ObjectId: str}

    )
 
class ReviewResponse(BaseModel):

    id: str

    tool_id: str

    tool_name: str

    rating: int

    comment: Optional[str]

    status: str

    date: str

    model_config = ConfigDict(

        populate_by_name=True,

        json_encoders={ObjectId: str}

    )
 
class ReviewAction(BaseModel):

    status: str
 