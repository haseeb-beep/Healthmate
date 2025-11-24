# HealthMate – Your Partner in Need  
A responsive, web-based **Digital Health Record System** prototype that connects **Patients, Doctors, and Admins** on a single platform.

## Overview
HealthMate is a frontend prototype built with HTML, CSS, Bootstrap, and JavaScript.  
It simulates a basic EHR workflow — users can sign up/login, patients can book appointments, doctors can add diagnoses/prescriptions, and admins can manage doctors and view system stats. Data is stored in the browser using **localStorage** to mimic a backend. 

## Group Members
- Haseeb Haider  
- Abdul Rehman  

## Technologies Used
- HTML5  
- CSS3  
- Bootstrap 5  
- JavaScript (Vanilla JS)  
- Browser LocalStorage (for data simulation)

## Project Files
- `index.html` — Landing page + Authentication + Role-based dashboards  
- `dashboard.html` — Additional dashboard layout page  
- `style.css` — Theme styling (teal/mint + glassmorphism UI)  
- `script.js` — Full interactivity, routing, and localStorage database  
- `bg.jpg` — Background theme image  
- `logo1.png` — HealthMate logo  

## Core Features
### Authentication
- Login / Signup  
- Role selection during signup (Patient / Doctor)  
- Session handling with localStorage  

### Patient Module
- Patient dashboard  
- Book appointment with a doctor  
- View appointment history  
- View prescriptions and latest diagnosis  

### Doctor Module
- Doctor dashboard  
- See pending appointments  
- Select patient and add:
  - Blood Pressure
  - Weight
  - Diagnosis notes
  - Prescription  
- Completed visits saved into patient history  

### Admin Module
- Admin dashboard  
- View system stats:
  - Total patients
  - Total doctors
  - Total appointments  
- Add new doctors  
- Delete doctors (prototype safe checks included)

## Demo Login Credentials (Seed Data)
Use these to test quickly:

| Role   | Username | Password |
|--------|----------|----------|
| Admin  | admin    | 123      |
| Doctor | doctor   | 123      |
| Patient| patient  | 123      |

## How to Run the Project
1. Download/clone this repository.
2. Open the project folder in VS Code.
3. Start a live server:
   - Right click `index.html`
   - Select **Open with Live Server**
4. The project will run in your browser.

> No backend required. Everything runs locally using localStorage.

## Notes
- This is a **prototype** only; a real system would need a secure backend and database.
- The UI follows the HealthMate brand using teal/mint colors and healthcare-style glass UI.

## License
This project is for academic / learning purposes.
