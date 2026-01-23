# CertifyNeo Backend (MVP)

## Setup
1. `cd apps/api`
2. `npm install`
3. Copy `.env.example` to `.env` (optional, defaults provided)
4. `node index.js`

## Endpoints

### Auth
- **POST** `/api/auth/register` - `{ "email": "test@test.com", "password": "123" }`
- **POST** `/api/auth/login` - `{ "email": "test@test.com", "password": "123" }`
- **GET** `/api/auth/me` - Headers: `Authorization: Bearer <token>`

### Uploads
- **POST** `/api/uploads` - Form-data key `file` (CSV or XLSX).

### Batches (Generation)
- **POST** `/api/batches` - Create batch.
- **POST** `/api/batches/:id/generate` - Generate certificates.
- **GET** `/api/batches/:id/status` - Check status.

## Sample Data
- `sample_certifyneo.csv`: Contains the updated field structure for Phase 2 (`name,event,position,date,certificate_id,email,signature_url`).

## Security Check
- **Vulnerability**: `xlsx` (SheetJS) reported a High Severity vulnerability (Prototype Pollution/ReDoS).
- **Status**: `npm audit` reports "No fix available" for the current npm registry version.
- **Action**: Known issue in MVP scope. For production, we would switch to the vendor-signed release from `cdn.sheetjs.com` or an alternative library like `exceljs`.

## Directories
- `uploads/`: Stores uploaded files.
- `generated/`: Stores generated certificates.
