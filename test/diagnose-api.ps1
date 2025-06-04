# API Diagnostic Script
$API_BASE_URL = "http://localhost:3000"

Write-Host "API Diagnostic Report"
Write-Host "===================="
Write-Host ""

# Check if server is running
Write-Host "1. Checking if server is running on port 3000..."
try {
    $response = Invoke-WebRequest -Uri $API_BASE_URL -Method GET -TimeoutSec 5
    Write-Host "✓ Server is responding on port 3000"
    Write-Host "Status Code: $($response.StatusCode)"
} catch {
    Write-Host "✗ Server is not responding on port 3000"
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Please check:"
    Write-Host "- Is your API server running?"
    Write-Host "- Is it running on port 3000?"
    Write-Host "- Try running: npm start or node server.js"
    exit 1
}

Write-Host ""

# Check available endpoints
$endpoints = @(
    "/api/search-by-class-id",
    "/api/generate-ics", 
    "/api/get-ics-link"
)

Write-Host "2. Checking available endpoints..."
foreach ($endpoint in $endpoints) {
    try {
        $url = "$API_BASE_URL$endpoint"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5
        Write-Host "✓ $endpoint - Status: $($response.StatusCode)"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 405) {
            Write-Host "✓ $endpoint - Exists (Method Not Allowed is expected for POST endpoints)"
        } elseif ($statusCode -eq 404) {
            Write-Host "✗ $endpoint - Not Found (404)"
        } else {
            Write-Host "? $endpoint - Status: $statusCode"
        }
    }
}

Write-Host ""

# Test the working endpoint (search-by-class-id)
Write-Host "3. Testing search-by-class-id endpoint (if available)..."
try {
    $testData = @{
        classId = "B220422"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Method Post `
        -Uri "$API_BASE_URL/api/search-by-class-id" `
        -ContentType "application/json" `
        -Body $testData `
        -TimeoutSec 10

    Write-Host "✓ search-by-class-id endpoint is working"
    Write-Host "Response type: $($response.GetType().Name)"
    
    if ($response.examData) {
        Write-Host "✓ Found exam data with $($response.examData.Count) exams"
    } else {
        Write-Host "? No examData field in response"
    }
} catch {
    Write-Host "✗ search-by-class-id endpoint failed"
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Diagnostic completed."
Write-Host ""
Write-Host "Next steps:"
Write-Host "- If endpoints are missing, you may need to implement them"
Write-Host "- Check your server routing configuration"
Write-Host "- Verify the API endpoints match your implementation" 