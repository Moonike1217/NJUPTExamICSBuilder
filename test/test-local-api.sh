#!/bin/bash

# Set local API base URL
API_BASE_URL="http://localhost:3000/api"

# Test data with exam information
TEST_DATA='{
  "examData": [
    {
      "courseName": "Computer Science",
      "teacher": "Prof. Zhang",
      "date": "2024-06-18",
      "startTime": "13:30",
      "endTime": "15:20",
      "location": "Room 101",
      "studentCount": 50
    },
    {
      "courseName": "Mathematics",
      "teacher": "Prof. Li",
      "date": "2024-06-20",
      "startTime": "09:00",
      "endTime": "10:50",
      "location": "Room 203",
      "studentCount": 45
    }
  ]
}'

echo "Starting API tests..."
echo "1. Testing get download link endpoint..."

# Send POST request to get download link
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  "${API_BASE_URL}/get-ics-link")

echo "API Response: $RESPONSE"

# Extract download URL from response
DOWNLOAD_URL=$(echo $RESPONSE | grep -o '"downloadUrl":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DOWNLOAD_URL" ]; then
  echo "Error: Could not get download link"
  exit 1
fi

echo "Got download link: $DOWNLOAD_URL"
echo "2. Testing file download..."

# Download the ICS file
curl -s -o "test-exams.ics" "$DOWNLOAD_URL"

if [ $? -eq 0 ]; then
  echo "File downloaded successfully as test-exams.ics"
  echo "File content preview:"
  head -n 15 test-exams.ics
  echo ""
  echo "File size: $(wc -c < test-exams.ics) bytes"
else
  echo "File download failed"
  exit 1
fi

echo "3. Testing direct ICS generation endpoint..."

# Test direct ICS generation
ICS_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  "${API_BASE_URL}/generate-ics")

echo "Direct ICS generation response length: $(echo $ICS_RESPONSE | wc -c) characters"

# Save direct response to file for comparison
echo "$ICS_RESPONSE" > "direct-exams.ics"
echo "Direct ICS content saved as direct-exams.ics"

echo "Test completed successfully!" 