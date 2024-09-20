# Project Room Rover - Backend 🚀

## Overview

Room Rover is an advanced hotel booking application created by me, that leverages cutting-edge AI technology to provide personalized hotel recommendations and an intuitive booking experience. This repository contains the backend code for Room Rover, showcasing a robust architecture and modern development practices.

## Live Demo


https://github.com/Chamikajaya/room-rover-backend/assets/109778419/a83dd483-28b7-4246-ad64-4232fd4bade0

## Key Features

- AI-powered hotel recommendations
- Real-time chatbot assistance using RAG (Retrieval-Augmented Generation)
- Secure user authentication and authorization
- Efficient hotel search and booking system
- Continuous deployment pipeline for rapid and reliable updates

## RAG-powered Chatbot

Roomie the chatbot utilizes the RAG (Retrieval-Augmented Generation) architecture to provide context-aware, accurate responses to user queries.

![rag-pipeline.drawio.png](architecture-diagrams%2Frag-pipeline.drawio.png)

## Continuous Deployment Pipeline

I  employed a robust continuous deployment pipeline to ensure rapid, reliable updates to  production environment.

![devops-pipeline.drawio.png](architecture-diagrams%2Fdevops-pipeline.drawio.png)

CD pipeline includes:
1. Automated versioning
2. Dependency installation and build process
3. Docker image creation and pushing to Docker Hub
4. Deployment to AWS EC2
5. Automated Git repository updates



**This repository holds the backend source code of my project Room Rover**

- Frontend Source Code: [https://github.com/Chamikajaya/room-rover-frontend](https://github.com/Chamikajaya/room-rover-frontend)
- Backend Source Code: [https://github.com/Chamikajaya/room-rover-backend](https://github.com/Chamikajaya/room-rover-backend)




## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Prisma ORM
- **AI and Machine Learning:** Vertex AI (for embeddings - text-embedding-004  and for  language model - gemini pro 1.5)  
- **Vector Database:** Pinecone
- **Containerization:** Docker
- **CI/CD:** Jenkins
- **Cloud Services:** AWS EC2
- **Version Control:** Git, GitHub

## Environment Variables - Backend 🔧

Here are the environment variables you need to configure before running the application:

```env
DATABASE_URL=add_mongodb_database_url_here
NODE_ENV=development

EMAIL_PASSWORD=if_you_are_using_gmail_add_the_password_given_to_you_by_visiting_Google_Cloud_Platform
EMAIL=your_email_for_sending_emails_on_behalf_of_Room_Rover

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CLIENT_URL=http://localhost:3000

JWT_SECRET=

STRIPE_SECRET_KEY=
```
## Running the Backend 🏃‍♂️

- **Clone the repository**
  ```
   git clone https://github.com/Chamikajaya/room-rover-backend.git
  ```
- **Add the .env file in the root directory with the necessary environment variables.**

- **Install dependencies and run the development server:**
  ```
  npm install
  npm run dev
  ```


