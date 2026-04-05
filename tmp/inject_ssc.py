import requests
import json

url = "http://localhost:3000/api/jobs"

ssc_job = {
    "id": "ssc-cgl-2025",
    "title": "SSC Combined Graduate Level Examination 2025",
    "organization": "Staff Selection Commission (SSC)",
    "type": "Central Government",
    "tags": ["ssc", "graduate", "central", "all-india"],
    "totalVacancy": 14582,
    "description": "Staff Selection Commission has released the Combined Graduate Level Examination 2025 notification to recruit approximately 14582 vacancies across various Group B and C posts in central government departments. Candidates must have a bachelor's degree from a recognized university. Selection will be conducted through Tier-I and Tier-II examinations followed by document verification.",
    "qualification": [
        {
            "name": "Graduate",
            "level": 4,
            "branches": ["any"],
            "extraConditions": ["Degree from recognized university"]
        },
        {
            "name": "Graduate (Statistics)",
            "level": 4,
            "branches": ["Statistics"],
            "extraConditions": ["Statistics as compulsory subject"]
        }
    ],
    "postNames": [
      "Assistant Section Officer", "Inspector of Income Tax", "Inspector (Central Excise)",
      "Inspector (Preventive Officer)", "Inspector (Examiner)", "Assistant Enforcement Officer",
      "Sub Inspector (CBI)", "Inspector Posts", "Inspector (Central Bureau of Narcotics)",
      "Section Head", "Executive Assistant", "Research Assistant", "Divisional Accountant",
      "Sub Inspector (NIA)", "Junior Intelligence Officer", "Junior Statistical Officer",
      "Statistical Investigator Grade-II", "Office Superintendent", "Auditor", "Accountant",
      "Junior Accountant", "Postal Assistant", "Sorting Assistant", "Senior Secretariat Assistant",
      "Upper Division Clerk", "Senior Administrative Assistant", "Tax Assistant"
    ],
    "selectionProcess": ["Tier-I Computer Based Examination", "Tier-II Computer Based Examination", "Document Verification"],
    "importantDates": {
        "notificationRelease": "2025-06-09",
        "startDate": "2025-06-09",
        "lastDate": "2025-07-04",
        "examDate": "2025-08-13"
    },
    "salary": {
        "min": 25500,
        "max": 142400,
        "currency": "INR"
    },
    "location": ["All India"],
    "ageLimit": {
        "min": 18,
        "max": 32,
        "asOnDate": "2025-08-01"
    },
    "applicationFee": {
        "general": 100,
        "obc": 100,
        "sc": 0,
        "female": 0
    },
    "officialWebsite": "https://ssc.gov.in",
    "source": "GovRecruit Official Registry"
}

try:
    response = requests.post(url, json=ssc_job)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
