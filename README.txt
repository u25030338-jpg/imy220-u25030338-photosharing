IMY 220 Project 2026
Photo Sharing Website
Deliverable 1

Student:
Manasse Kabongo

GitHub Repository:
https://github.com/u25030338-jpg/imy220-u25030338-photosharing.git


========================================
PROJECT STRUCTURE
========================================

frontend/
    React + Vite frontend application

backend/
    Express backend server

Documentation/
    Project documentation

wireframes/
    Project wireframes


========================================
DOCKER REQUIREMENTS
========================================

The project uses two separate Docker containers:

1. photoshare-frontend
2. photoshare-backend


========================================
BUILDING THE DOCKER IMAGES
========================================

From the project root directory:

docker build -t photoshare-frontend ./frontend

docker build -t photoshare-backend ./backend


========================================
RUNNING THE DOCKER CONTAINERS
========================================

Run the backend:

docker run -d --name photoshare-backend -p 5000:5000 photoshare-backend

Run the frontend:

docker run -d --name photoshare-frontend -p 5173:5173 photoshare-frontend


========================================
ACCESSING THE APPLICATION
========================================

Frontend:

http://localhost:5173

Backend:

http://localhost:5000


========================================
STOPPING THE CONTAINERS
========================================

docker stop photoshare-frontend
docker stop photoshare-backend


========================================
REMOVING THE CONTAINERS
========================================

docker rm photoshare-frontend
docker rm photoshare-backend