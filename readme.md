---

# Retail Pulse Job Processing Service

This is a backend service for processing images collected from stores. The service allows users to submit jobs for processing images, where the system calculates the perimeter of each image and simulates GPU processing. The results are then stored in an SQLite database.

## Features

- Submit jobs to process images from various stores.
- Calculate the perimeter of each image (`2 * (Height + Width)`).
- Introduce a random delay (0.1-0.4 seconds) to simulate GPU processing time.
- Store job and image processing results in an SQLite database.
- Check the status of jobs to see whether they are ongoing or completed.

---

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/retail-pulse-job-processing.git
cd retail-pulse-job-processing
```

### 2. Install Dependencies

Make sure you have **Node.js** and **npm** installed on your machine.

```bash
npm install
```

### 3. Set Up SQLite Database

SQLite database is used to store job details and results. The database file `jobs.db` will be automatically created when the server is first run.

### 4. CSV File for Store IDs

Ensure you have the `store_master.csv` file in the root directory with the following format:

```csv
AreaCode,StoreName,StoreID
7100015,B P STORE,RP00001
7100015,MONAJ STORE,RP00002
7100015,ZARDA HOUSE,RP00003
...
```

### 5. Run the Application

To start the application, run the following command:

```bash
node app.js
```

Your server will now be running on `http://localhost:3000`.

---

## API Endpoints

### 1. **Submit Job**

- **URL**: `/api/submit`
- **Method**: `POST`
- **Request Body**:

```json
{
  "count": 2,
  "visits": [
    {
      "store_id": "S00339218",
      "image_url": ["https://www.gstatic.com/webp/gallery/2.jpg"],
      "visit_time": "2024-12-10T10:00:00Z"
    },
    {
      "store_id": "S01408764",
      "image_url": ["https://www.gstatic.com/webp/gallery/3.jpg"],
      "visit_time": "2024-12-10T11:00:00Z"
    }
  ]
}
```

- **Success Response**:

```json
{
  "job_id": "e6abd582-bc56-4d21-b7df-842aaf87b6de"
}
```

- **Error Response**:

```json
{
  "error": "Invalid store_id or missing fields"
}
```

---

### 2. **Get Job Status**

- **URL**: `/api/status?jobid={job_id}`
- **Method**: `GET`

- **Success Response**:

```json
{
  "status": "completed",
  "job_id": "e6abd582-bc56-4d21-b7df-842aaf87b6de"
}
```

- **Failure Response**:

```json
{
  "status": "failed",
  "job_id": "e6abd582-bc56-4d21-b7df-842aaf87b6de",
  "error": [
    {
      "store_id": "RP00001",
      "error": "Invalid image URL"
    }
  ]
}
```

---

## Database Structure

The project uses **SQLite** for data storage. Below is the schema for the main tables:

### 1. **Jobs Table**

| Column   | Description                                                   |
| -------- | ------------------------------------------------------------- |
| `job_id` | Unique identifier for the job.                                |
| `status` | Current status of the job (`completed`, `ongoing`, `failed`). |

Example:

```sql
job_id                               status
-----------------------------------  ---------
6ad8d6a5-b822-449f-a78a-5c49a1e0d1c9  completed
```

---

### 2. **Job Results Table**

| Column      | Description                                 |
| ----------- | ------------------------------------------- |
| `job_id`    | ID of the related job.                      |
| `store_id`  | ID of the store associated with the images. |
| `image_url` | URL of the processed image.                 |
| `perimeter` | Calculated perimeter of the image.          |

Example:

```sql
job_id                               store_id  image_url                                perimeter
-----------------------------------  ---------  ---------------------------------------  ----------
6ad8d6a5-b822-449f-a78a-5c49a1e0d1c9  RP00001   https://www.gstatic.com/webp/gallery/2.jpg  600
6ad8d6a5-b822-449f-a78a-5c49a1e0d1c9  RP00002   https://www.gstatic.com/webp/gallery/3.jpg  800
```

---

## Troubleshooting

- **Missing Database File**:

  - Ensure the application has write permissions to the working directory.
  - If the database is missing, restart the application to recreate it.

- **Invalid Store ID**:
  - Verify that the `store_id` exists in the `store_master.csv` file.

---

## Testing API Endpoints

To test the API, use the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) VS Code extension.

Create a `test.http` file with the following contents:

### Submit Job

```http
POST http://localhost:3000/api/submit
Content-Type: application/json

{
  "count": 2,
  "visits": [
    {
      "store_id": "RP00001",
      "image_url": ["https://www.gstatic.com/webp/gallery/2.jpg"],
      "visit_time": "2024-12-10T10:00:00Z"
    },
    {
      "store_id": "RP00002",
      "image_url": ["https://www.gstatic.com/webp/gallery/3.jpg"],
      "visit_time": "2024-12-10T11:00:00Z"
    }
  ]
}
```

---

### Get Job Status

```http
GET http://localhost:3000/api/status?jobid=83742e3b-6116-4f75-84d2-cd1ccacef26b
```

**Steps**:

1. Run the "Submit Job" request and copy the `job_id` from the response.
2. Paste the `job_id` in the "Get Job Status" request to check the status.

---
