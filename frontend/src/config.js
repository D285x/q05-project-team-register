export const API = (import.meta.env.VITE_API_URL || '') + '/api/team-members'
export const TITLE = "Project Team Register"
export const NOUN = "Team record"
export const FIELDS = [
  {
    "name": "rollNumber",
    "label": "Roll Number",
    "type": "text",
    "required": true
  },
  {
    "name": "studentName",
    "label": "Student Name",
    "type": "text",
    "required": true
  },
  {
    "name": "teamName",
    "label": "Team Name",
    "type": "text",
    "required": true
  },
  {
    "name": "projectTitle",
    "label": "Project Title",
    "type": "text",
    "required": true
  }
]
