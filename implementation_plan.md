# CogniCare - MERN Stack Implementation Plan

The objective is to convert the basic HTML/CSS template into a full-stack, enterprise-grade AI dementia monitoring system. The project will be built using the MERN stack (MongoDB, Express, React, Node.js) with integrated AI services.

## Architecture & Technology Stack

- **Frontend**: React.js (Vite), Pure CSS / CSS Modules for a medical-grade layout (Mainly White/Light Blue themes), WebRTC for camera integration.
- **Backend**: Node.js + Express.js.
- **Database**: MongoDB (Local or Atlas) for Users, Tests, and Reports.
- **AI/ML Utilities**:
  - **OpenCV.js & Face-API.js**: Client-side CNN face detection and eye gaze tracking.
  - **Web Speech API**: In-browser speech recognition and synthesis for the auditory cognitive tests.
  - **OpenAI API**: For the rule-based / open-ended chatbot capabilities and generating post-7-day qualitative AI evaluations and doctor recommendations.

## Proposed Changes & Project Structure

The codebase will reside in `d:\Project-PEP`.

### 1. `backend/` Component
The backend will manage business logic, scheduling, database updates, and authentication.
- **Auth**: JWT-based REST APIs (`/api/auth/register`, `/api/auth/login`).
- **Users**: Admin, Caregiver, and Patient roles mapping.
- **Tests**: Store daily cognitive test scores, response times, and attention metrics. Ensure Day 1 to Day 7 validation prevents multiple daily attempts.
- **Alerts**: API for Caregivers to notify patients about pending tests.
- **AI Risk Analysis Engine**: Cron job / scheduled logic to evaluate 7-day cumulative results and categorize them as Low/Medium/High risk. Needs a prompt generated for the OpenAI endpoint to fetch doctor suggestions.

### 2. `frontend/` Component
The React frontend will mirror the user-specified functionalities with a clean, elderly-friendly, multi-lingual design.
- **State Management**: Context API / Zustand for the selected Role, Auth State, and `Language` (EN, TA, HI).
- **Core Pages**:
  - `Login / Register` (with brand logos).
  - `Admin Dashboard`: Assign caregivers, global system chart metrics.
  - `Caregiver Dashboard`: Track assigned patients, view patient test statuses, trigger "missed test" alerts (Caregiver cannot take tests).
  - `Patient Dashboard`: Take tests (gradually increasing difficulty), view basic summaries, Chatbot interface.
- **Test Modules**:
  - WebRTC Camera preview components.
  - OpenCV.js / Face-api.js overlay to track attention.
  - Dynamic Memory Recall, Reaction Test, and Sentence Recitation (Speech Test).

## User Review Required

> [!IMPORTANT]
> - **AI Integration**: The face detection logic will be processed entirely on the client-side browser using `face-api.js` (which is CNN-based) and `OpenCV.js` constraints. This reduces backend latency. Are you comfortable with client-side detection?
> - **OpenAI API Key**: We will require an OpenAI API Key to enable the qualitative risk summary and advanced intelligent chatbot. I will implement a service that reads from a `.env` file, meaning you will have to provide this API key inside the `.env` when the build is complete.
> - **Database**: Since you mentioned MongoDB, I plan to set up Mongoose models. Is a local MongoDB instance fine, or do you have a MongoDB Atlas URI?

## Open Questions

1. Which Tailwind version / React UI library would you prefer? I will implement exactly the soft, professional CSS from your prompt, but would you be fine with plain CSS modules, or do you want a framework like Material-UI/Tailwind?
2. Do you have a specific database URI for MongoDB, or should I default to `mongodb://localhost:27017/cognicare`?
3. What is the scope for the Speech test? Is a single given sentence per day that the patient must repeat enough, utilizing the built-in browser Web Speech API?

## Verification Plan

### Automated/Unit Testing
- Verify that users cannot take two tests on the same day through Node.js endpoints.
- Check role access constraints on Admin and Caregiver API routes.

### Manual Verification
- Deploying frontend and simulating patient logins on Days 1 through 7 to verify dynamic test generation.
- Accessing camera to ensure OpenCV triggers "Active Attention" versus "Not Detected".
- Trigger Caregiver alert and check patient dashboard notification.
