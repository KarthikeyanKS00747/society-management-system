# Society Management System

## Overview

The Society Management System is a web-based application developed to digitize and streamline the daily operations of residential societies. Traditional society management often involves manual record-keeping, paperwork, and delayed communication between administrators and residents. This system eliminates these inefficiencies by providing a centralized digital platform where all society-related activities can be managed efficiently.

## Objectives

* Automate routine society management tasks.
* Reduce manual effort and paperwork.
* Improve communication between residents and administrators.
* Provide a secure and centralized data management system.
* Enhance transparency in billing, payments, and complaint resolution.

## Key Features

### 1. User Registration and Secure Login

The system allows residents and administrators to register and log in securely. Authentication mechanisms ensure that only authorized users can access the platform, protecting sensitive society data.

### 2. Role-Based Access Control

The application provides dedicated dashboards for different user roles:

**Admin Dashboard**

* Manage residents and user accounts.
* Generate maintenance bills.
* Track payments.
* Handle complaints.
* Post announcements.
* Approve or reject facility bookings.
* View system reports.

**Resident Dashboard**

* View and pay maintenance bills.
* Track payment history.
* Register complaints and monitor their status.
* Book society halls or shared facilities.
* Receive notifications and announcements.
* Update personal profile details.

### 3. Maintenance Bill Generation and Payment Tracking

Administrators can automatically calculate maintenance charges based on predefined criteria. The system generates bills and maintains a complete payment history, enabling admins to track pending dues and residents to view their financial records transparently.

### 4. Online Complaint Registration and Tracking

Residents can submit complaints related to maintenance, security, or other society issues through the portal. Admins can review, assign, and update the complaint status, ensuring faster resolution and better accountability.

### 5. Hall and Facility Booking System

The platform provides an easy-to-use booking interface for common facilities such as community halls, gyms, or meeting rooms. Admin approval workflows prevent scheduling conflicts and ensure fair usage.

### 6. Notification and Announcement System

Admins can broadcast important notices, meeting updates, maintenance schedules, or emergency alerts directly through the system. Residents receive these notifications instantly, improving overall communication.

## Tech Stack

**Frontend**

* HTML
* CSS
* JavaScript
* React.js

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB

## Installation Guide

### Prerequisites

* Node.js installed
* MongoDB installed or access to MongoDB Atlas
* npm or yarn package manager

### Steps to Run Locally

1. Clone the repository:

```
git clone https://github.com/your-username/society-management-system.git
```

2. Navigate to the project directory:

```
cd society-management-system
cd frontend
```

3. Install dependencies:

```
npm install
```

4. Configure environment variables:
   Create a `.env` file and add:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

5. Start the server:

```
npm run dev
```

6. Open the browser and visit:

```
http://localhost:5000 <!-- You should see a link like this -->
```

## Benefits of the System

* Minimizes paperwork and manual errors.
* Saves time for both administrators and residents.
* Provides real-time updates and communication.
* Ensures secure handling of society data.
* Improves operational efficiency.
* Creates a transparent financial system.

## Future Enhancements

* Integration with online payment gateways.
* Mobile application support.
* Visitor management system.
* Parking management module.
* Automated reminders for due payments.
* Advanced analytics dashboard.
* Multi-society support within a single platform.

