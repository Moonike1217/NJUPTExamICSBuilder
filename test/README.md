# API Test Scripts

This directory contains test scripts for the exam calendar API running on local port 3000.

## Files

- `test-local-api.sh` - Bash script for Linux/Mac testing
- `test-local-api.ps1` - PowerShell script for Windows testing  
- `curl-commands.txt` - Individual curl commands for quick testing

## Prerequisites

1. API server must be running on `http://localhost:3000`
2. Required endpoints:
   - `/api/get-ics-link` - Generate download link for ICS file
   - `/api/generate-ics` - Direct ICS file generation
   - `/api/download-ics/:fileId` - Download ICS file by ID
   - `/api/search-by-class-id` - Search exams by class ID

## Usage

### For Windows (PowerShell)
```powershell
cd test
.\test-local-api.ps1
```

### For Linux/Mac (Bash)
```bash
cd test
chmod +x test-local-api.sh
./test-local-api.sh
```

### Individual curl commands
Copy commands from `curl-commands.txt` and run them individually.

## Test Flow

1. **Get Download Link**: Send exam data to get a download URL
2. **Download File**: Use the returned URL to download ICS file  
3. **Direct Generation**: Test direct ICS generation endpoint
4. **File Verification**: Check downloaded files and compare content

## Expected Results

- Successfully generated download links
- Downloaded ICS files with calendar data
- File sizes should be > 0 bytes
- Content should include VCALENDAR format

## Troubleshooting

- Ensure API server is running on port 3000
- Check network connectivity to localhost
- Verify JSON request format matches API expectations
- Check file permissions for script execution 