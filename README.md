# Flight Reservation System

A full-stack web application for flight reservations, built with React, Node.js, Express, and MongoDB.

## Features

### User Features
- User registration and authentication
- Flight search with filters:
  - Departure city
  - Arrival city
  - Date
- Price sorting (Low to High / High to Low)
- Seat selection with visual seat map
- Ticket booking with passenger information
- View and manage tickets
- Profile management:
  - Update personal information
  - Change password
- View booking history

### Admin Features
- Admin authentication
- Flight management:
  - Add new flights
  - Edit existing flights
  - Delete flights (automatically cancels related tickets)
  - View all flights
- Ticket management:
  - View all tickets
  - Track ticket status
  - View passenger information
- Real-time updates when flights are modified or deleted

### Security Features
- JWT authentication
- Password hashing
- Protected routes
- Role-based access control

## Technical Features
- Responsive design
- Real-time data updates
- Form validation
- Error handling
- Date and time validation
- Seat availability checking
- Dynamic price sorting
- City validation (prevent same city selection)

## Tech Stack

### Frontend
- React
- Material-UI (MUI)
- Axios
- React Router
- Date-fns

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Bcrypt

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the application
```bash
# Start the server
cd server
npm start

# Start the client
cd ../client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user info

### Flights
- GET /api/flights - Get all flights
- GET /api/flights/:id - Get flight by ID
- GET /api/flights/search - Search flights

### Tickets
- POST /api/tickets - Create a new ticket
- GET /api/tickets/my-tickets - Get user's tickets
- DELETE /api/tickets/:id - Cancel a ticket

### Admin
- POST /api/admin/login - Admin login
- GET /api/admin/flights - Get all flights (admin)
- POST /api/admin/flights - Create a new flight
- PUT /api/admin/flights/:id - Update a flight
- DELETE /api/admin/flights/:id - Delete a flight
- GET /api/admin/tickets - Get all tickets (admin)

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License. 