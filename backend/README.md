# Backend

## Tech Stack

| Technology | Use            |
| ---------- | -------------- |
| Node.js    | Runtime        |
| Express.js | Routing        |
| JWT        | Authentication |
| Zod        | Validation     |
| Mongoose   | ODM            |
| MongoDB    | Database       |

## Setup

1. Clone the repo

   ```bash
   git clone https://github.com/Verappansm/scope_new_proj.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment Variables

   Create a `.env` file in the backend directory with the following variables:

   ```env
   PORT=5000
   MONGO_URI='mongodb://localhost:27017/scope'
   JWT_SECRET='Akkilesh'
   ```

4. For development

   ```bash
   nodemon server.js
   ```

   (or)

   ```bash
   node server.js
   ```

   (or)

   ```bash
   npm run start
   ```
