# Project Room Rover - Backend 🚀

## Live Demo


https://github.com/Chamikajaya/room-rover-backend/assets/109778419/a83dd483-28b7-4246-ad64-4232fd4bade0



**This repository holds the backend source code of my project Room Rover**

- Frontend Source Code: [https://github.com/Chamikajaya/room-rover-frontend](https://github.com/Chamikajaya/room-rover-frontend)
- Backend Source Code: [https://github.com/Chamikajaya/room-rover-backend](https://github.com/Chamikajaya/room-rover-backend)

## Technologies Used 🛠️

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **ORM:** Prisma
- **Frontend:** Next.js (React Framework), Tailwind CSS, ShadCN UI Library
- **Authentication:** JSON Web Tokens (JWT)

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


