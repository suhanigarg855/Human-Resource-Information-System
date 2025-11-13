# HRIS System (Human Resource Information System)

This project is a fully functional HRIS (Human Resource Information System) built using Lovable for authentication, database, and backend services. It includes employee management, leave requests, attendance tracking, and role-based access for Admin and Employees.

## ✨ Features

### Admin Features
- View a dashboard with:
  - Total employees
  - Pending, approved, and rejected leaves
  - Daily attendance overview
- Manage employees:
  - Add new employees
  - Edit employee information
- Review and approve/reject employee leave requests
- View attendance records for all employees

### Employee Features
- View personal dashboard with:
  - Leave status and history
  - Daily attendance status
- Apply for leave
- View leave application results after admin approval or rejection
- Mark daily attendance (present/absent)

## 🔐 Authentication & Roles

Two roles exist in the system:

### Admin
- The admin account was created via registration:
```
Email: admin@example.com  
Password: Admin123!
```

- After signup, the role was elevated to admin in the Supabase backend.
- There is currently one admin in the system.

### Employee
- Employees register normally using their email and password.
- After logging in, they access the employee dashboard with limited permissions.

## 📌 How to Use the System

### 1. Adding Employees (Admin)

Admins can add employees directly from the Employees section:

1. Go to Employees → Add Employee
2. Fill out the employee details (name, email, position, date of joining)
3. Submit the form
4. The employee record appears immediately in the employee list

**Note:** The system currently redirects to the employee dashboard after adding. This behavior is acceptable for this version but may be refined in future iterations.

### 2. Applying for Leave (Employee)

Employees can submit leave requests by:

1. Navigating to Leaves
2. Clicking Apply for Leave
3. Selecting leave type, start/end date, and providing a reason
4. Submitting the request

Employees can view:
- Their leave history
- The approval status once reviewed by the admin

### 3. Approving or Rejecting Leaves (Admin)

Admins can manage all leave requests by:

1. Navigating to Leaves
2. Reviewing pending requests
3. Clicking ✔ Approve or ✖ Reject

The updated status appears immediately in:
- The admin panel
- The respective employee's dashboard

### 4. Tracking Attendance

#### As an Employee
- Navigate to Attendance
- Mark today's attendance (Present/Absent)
- The system prevents multiple markings for the same day

#### As an Admin
Admins can see:
- All employee attendance records
- Daily attendance summary on the dashboard

## 🗂️ Database & Backend

The project uses Supabase tables:
- `profiles` — employee profiles
- `user_roles` — admin/employee roles
- `leaves` — leave applications
- `attendance` — daily attendance

Row Level Security (RLS) ensures:
- Employees access only their own data
- Admins access everything

## 📄 Assumptions Made

- Authentication (email/password) is sufficient for role-based access.
- Employees can only create leave requests and attendance for themselves.
- The system supports one admin for simplicity, which can be expanded later.
- Attendance is restricted to one entry per employee per day.
- Redirect behavior after adding employees is acceptable for this version.

## 🚀 Deployment

The application is deployed using:
- Lovable Cloud (Frontend + Supabase Integration)
- Netlify (Final hosting)

## 📌 Notes

- All core features — employees, leaves, attendance, dashboards, and role-based access—are fully implemented and functional.
- Admin promotion and initial data setup were performed through the Supabase backend.
- The employee deletion flow is planned for enhancement in future updates.

## 🤍 P.S.

With a few additional credits on Lovable, this system could be extended even further such as smoother admin workflows, direct role assignment, and full CRUD automation. The current build demonstrates the essential HRIS functionality clearly and effectively.
