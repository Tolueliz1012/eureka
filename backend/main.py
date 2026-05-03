from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import tutor, curriculum

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://eureka.vercel.app", "https://*.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(tutor.router, prefix="/tutor")
app.include_router(curriculum.router, prefix="/curriculum")
