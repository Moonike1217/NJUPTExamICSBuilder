# Set local API base URL
$API_BASE_URL = "http://localhost:3000/api"

# Test data with exam information
$TEST_DATA = @{
    examData = @(
        @{
            courseName = "Computer Science"
            teacher = "Prof. Zhang"
            date = "2024-06-18"
            startTime = "13:30"
            endTime = "15:20"
            location = "Room 101"
            studentCount = 50
        },
        @{
            courseName = "Mathematics"
            teacher = "Prof. Li"
            date = "2024-06-20"
            startTime = "09:00"
            endTime = "10:50"
            location = "Room 203"
            studentCount = 45
        }
    )
} | ConvertTo-Json -Depth 3

Write-Host "Starting API tests..."
Write-Host "1. Testing get download link endpoint..."

try {
    # Send POST request to get download link
    $response = Invoke-RestMethod -Method Post `
        -Uri "${API_BASE_URL}/get-ics-link" `
        -ContentType "application/json" `
        -Body $TEST_DATA

    Write-Host "API Response: $($response | ConvertTo-Json)"

    if ($response.downloadUrl) {
        Write-Host "Got download link: $($response.downloadUrl)"
        Write-Host "2. Testing file download..."

        # Download the ICS file
        $outputFile = "test-exams.ics"
        Invoke-WebRequest -Uri $response.downloadUrl -OutFile $outputFile

        if (Test-Path $outputFile) {
            Write-Host "File downloaded successfully as $outputFile"
            Write-Host "File content preview:"
            Get-Content $outputFile -Head 15
            Write-Host ""
            Write-Host "File size: $((Get-Item $outputFile).Length) bytes"
        } else {
            Write-Host "File download failed"
            exit 1
        }
    } else {
        Write-Host "Error: Could not get download link"
        exit 1
    }
} catch {
    Write-Host "Error during download link test: $($_.Exception.Message)"
    exit 1
}

Write-Host "3. Testing direct ICS generation endpoint..."

try {
    # Test direct ICS generation
    $icsResponse = Invoke-RestMethod -Method Post `
        -Uri "${API_BASE_URL}/generate-ics" `
        -ContentType "application/json" `
        -Body $TEST_DATA

    Write-Host "Direct ICS generation response length: $($icsResponse.Length) characters"

    # Save direct response to file for comparison
    $icsResponse | Out-File -FilePath "direct-exams.ics" -Encoding UTF8
    Write-Host "Direct ICS content saved as direct-exams.ics"

} catch {
    Write-Host "Error during direct ICS generation test: $($_.Exception.Message)"
}

Write-Host "Test completed successfully!" 