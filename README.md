# Odoo-x-Hackathon

🛠️ Maintenance Request Management System

A role-based maintenance request management system designed to ensure clear approvals, controlled assignments, and zero auto-allocation. The system supports Admin, Manager, Technician, and Employee roles with a transparent, step-by-step workflow.

⸻

📌 Problem Statement

In many organizations, maintenance requests are either auto-assigned or poorly tracked, leading to:
	•	Lack of accountability
	•	Overloaded technicians
	•	No approval control
	•	Poor visibility of new requests

This system solves these issues by introducing admin-controlled approvals, assignment requests, and real-time visibility.

⸻

🎯 Key Objectives
	•	Prevent automatic assignment of requests
	•	Ensure Admin control over request approval
	•	Allow Employees & Technicians to request assignment
	•	Enable Admin/Manager to approve assignments
	•	Maintain a clear lifecycle for every request

⸻

👥 User Roles & Responsibilities

👨‍💼 Admin
	•	View all maintenance requests
	•	Accept or reject new requests
	•	Approve or reject assignment requests
	•	Assign requests to Manager, Technician, or Employee

🧑‍💼 Manager
	•	View accepted requests
	•	Approve or reject assignment requests
	•	Monitor and reassign work if needed

👷 Technician
	•	Create maintenance requests
	•	Request assignment for unassigned tasks
	•	Work on assigned requests and update status

👨‍🔧 Employee
	•	Create maintenance requests
	•	Request assignment (if allowed)
	•	Track status of their own requests

⸻

🔄 Request Lifecycle (Status Flow)

CREATED
→ PENDING_APPROVAL
→ ACCEPTED
→ ASSIGNMENT_REQUESTED
→ ASSIGNED
→ IN_PROGRESS
→ COMPLETED / REJECTED


⸻

📝 Step-by-Step Workflow

1️⃣ Request Creation
	•	Employee or Technician submits a maintenance request
	•	Status set to PENDING_APPROVAL
	•	Request visible only to Admin

⸻

2️⃣ Admin Review
	•	Admin reviews request details
	•	Admin can:
	•	✅ Accept → status becomes ACCEPTED
	•	❌ Reject → status becomes REJECTED

⚠️ No auto-assignment occurs after acceptance

⸻

3️⃣ Assignment Request (Assign to Me)
	•	Employees/Technicians see accepted but unassigned requests
	•	User clicks Request Assign to Me
	•	Status changes to ASSIGNMENT_REQUESTED

⸻

4️⃣ Assignment Approval
	•	Admin or Manager reviews assignment request
	•	Can:
	•	✅ Approve & assign → status ASSIGNED
	•	❌ Reject → status reverts to ACCEPTED

⸻

5️⃣ Work Execution
	•	Assigned user starts work → status IN_PROGRESS
	•	After completion → status COMPLETED

⸻

🖥️ Dashboard Views

Admin Dashboard
	•	New Requests
	•	Accepted Requests
	•	Assignment Requests
	•	Active Requests
	•	Completed Requests

Manager Dashboard
	•	Assignment Requests
	•	Active Requests
	•	Team Workload Overview

Employee / Technician Dashboard
	•	My Requests
	•	Available Requests
	•	Assignment Request Status
	•	Completed Work

⸻

🔐 Business Rules
	•	❌ No automatic assignment
	•	✅ Admin approval is mandatory
	•	✅ Assignment requests require Admin/Manager approval
	•	✅ One user assigned per request
	•	✅ Role-based access & actions

⸻

💡 Why This System Works
	•	Clear authority & accountability
	•	Prevents misuse of self-assignment
	•	Real-time visibility of requests
	•	Scalable for large organizations
	•	Audit-friendly workflow

⸻

📢 One-Line Summary

“A controlled maintenance workflow where requests are approved by Admin and assignments are granted only after explicit authorization, ensuring transparency and accountability.”

⸻

🚀 Future Enhancements
	•	Real-time notifications
	•	SLA & priority escalation
	•	Analytics dashboard
	•	Mobile-first UI
	•	File & image uploads

⸻

This README can be directly used for GitHub, hackathons, or internal documentation.
