import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Create folder public/templates
const dir = './public/templates';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// 1. Registry Data
const registryData = [
  {
    'NAME OF INSTITUTION': 'AJ Tech Training Institute',
    'PROVINCE': 'Laguna',
    'Municipality': 'Calamba',
    'ADDRESS': '123 Innovation Way, Calamba City',
    "Name of Institution's Head": 'John Doe',
    'TEL. NO.': '049-555-0199',
    'E-mail Address': 'info@ajtech.edu.ph',
    'FB Account': 'facebook.com/ajtechtraining',
    'TYPE OF INSTITUTION': 'WTR',
    'CLASSIFICATION OF INSTITUTION': 'Private',
    'STATUS': 'Active',
    'SECTOR': 'Information and Communications Technology',
    'COURSE/REGISTERED PROGRAM (WTR/CoC)': 'Computer Systems Servicing NC II',
    'Description': 'CSS NC II Registered Program',
    'Qualification Code': 'ELC311203',
    'DURATION': 280,
    'PROGRAM REG. NO.': 'WTR-2026-0410',
    'DATE ISSUED': '2026-01-15',
    'EXPIRATION DATE': '2029-01-15',
    'DELIVERY MODE': 'Blended Learning',
    'Program Type (MCC, RCEF, etc.)': 'Regular',
    'Trainer': 'Alice Smith',
    'NTTC No.': 'NTTC-2026-8888',
    'Validity': '2028-06-20',
    'Specialization': 'Computer Systems Servicing NC II',
    'CTPR Serial Number': 'CTPR-889911',
    'Date Reported to CO': '2026-02-01',
    'COMPLIANCE AUDIT REMARKS': 'Complied with all facilities and tools requirements.',
    'Remarks': 'New Issuance'
  }
];

// 2. Assessment Centers Data
const assessmentData = [
  {
    'ASSESSMENT CENTER': 'Laguna Assessment Center Inc.',
    'Region': 'Region IV-A',
    'PROVINCE': 'Laguna',
    'ADDRESS': '456 Knowledge St, Santa Rosa',
    'LONGITUDE': 121.1114,
    'LATITUDE': 14.2137,
    'CENTER MANAGER': 'Robert Johnson',
    'TEL. NO.': '049-111-2222',
    'SECTOR': 'Information and Communications Technology',
    'QUALIFICATION TITLE': 'Computer Systems Servicing NC II',
    'ACCREDITATION NUMBER': 'AC-CSS-2026-0045',
    'DATE ACCREDITED': '2026-03-10',
    'VALID UNTIL': '2028-03-10',
    'Status': 'Active'
  }
];

// 3. Assessors Data
const assessorData = [
  {
    'NAME': 'Michael Brown',
    'REGION': 'Region IV-A',
    'PROVINCE': 'Laguna',
    'ADDRESS': '789 Skill Lane, Biñan',
    'SECTOR': 'Information and Communications Technology',
    'QUALIFICATION TITLE': 'Computer Systems Servicing NC II',
    'DATE OF ACCREDITATION': '2026-04-05',
    'VALID UNTIL': '2028-04-05',
    'Status': 'Active'
  }
];

// Write sheets
const writeSheet = (data, filename) => {
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
  xlsx.writeFile(wb, path.join(dir, filename));
};

writeSheet(registryData, 'registry_template.xlsx');
writeSheet(assessmentData, 'assessment_template.xlsx');
writeSheet(assessorData, 'assessor_template.xlsx');
console.log('Templates generated successfully.');
